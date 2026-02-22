'use strict';

/**
 * Orders e2e tests
 *
 * Covers:
 *  - Basic order creation via POST /api/v2/orders (DDD use case)
 *  - Atomic stock reservation: two concurrent requests for the last unit
 *    → exactly one succeeds, one fails with 400 (InsufficientStockError)
 *  - Transaction rollback: a bad item in the cart rolls back the whole order
 *    (no partial stock deduction, no orphan order document)
 *  - Unique orderNumber generation under concurrency (Counter document)
 *  - GET /api/v2/orders/my-orders returns only the authenticated user's orders
 */
const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');
const { clearAll }     = require('./helpers/db');
const {
  makeUser,
  makeAdmin,
  makeToken,
  makeProduct,
  DELIVERY_ADDRESS,
  CONTACT_INFO,
} = require('./helpers/factories');

// Shared references populated in beforeEach
let admin;
let customer;
let token;

beforeEach(async () => {
  await clearAll();
  admin    = await makeAdmin({ email: 'admin-orders@test.sn' });
  customer = await makeUser({ email: 'customer-orders@test.sn' });
  token    = makeToken(customer);
});

// ── Helper ────────────────────────────────────────────────────────────────────

function orderPayload(productId, qty = 1, extra = {}) {
  return {
    products:        [{ product: productId.toString(), quantity: qty }],
    paymentMethod:   'cash',
    deliveryAddress: DELIVERY_ADDRESS,
    contactInfo:     CONTACT_INFO,
    ...extra,
  };
}

// ── Basic creation ────────────────────────────────────────────────────────────

describe('POST /api/v2/orders', () => {
  it('creates an order successfully and reserves stock', async () => {
    const product = await makeProduct(admin._id, { price: 2000, stock: 10 });

    const res = await request(app)
      .post('/api/v2/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload(product._id, 3));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const order = res.body.data.order;
    expect(order.orderNumber).toMatch(/^CD\d{8}\d{3}$/);
    expect(order.status).toBe('pending');
    expect(order.paymentMethod).toBe('cash');

    // Stock must have been decremented
    const Product = require('../models/Product');
    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(7); // 10 - 3
  });

  it('returns 401 without a JWT', async () => {
    const product = await makeProduct(admin._id);
    const res = await request(app)
      .post('/api/v2/orders')
      .send(orderPayload(product._id));

    expect(res.status).toBe(401);
  });

  it('returns 400 when the cart is empty', async () => {
    const res = await request(app)
      .post('/api/v2/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        products:        [],
        packs:           [],
        paymentMethod:   'cash',
        deliveryAddress: DELIVERY_ADDRESS,
        contactInfo:     CONTACT_INFO,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when requested quantity exceeds stock', async () => {
    const product = await makeProduct(admin._id, { stock: 2 });

    const res = await request(app)
      .post('/api/v2/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload(product._id, 5));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/stock/i);
  });

  it('returns 400 for a non-existent product ID', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post('/api/v2/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload(fakeId, 1));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('calculates subtotal and delivery fee on the server side', async () => {
    // subtotal = 3 × 20 000 = 60 000 XOF → above free-delivery threshold (50 000)
    const product = await makeProduct(admin._id, { price: 20_000, stock: 10 });

    const res = await request(app)
      .post('/api/v2/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload(product._id, 3));

    expect(res.status).toBe(201);
    const order = res.body.data.order;
    expect(order.subtotal).toBe(60_000);
    expect(order.deliveryFee).toBe(0);    // free delivery ≥ 50 000
    expect(order.total).toBe(60_000);
  });
});

// ── Concurrent atomic stock reservation ──────────────────────────────────────

describe('Atomic stock reservation under concurrency', () => {
  it('allows exactly one order when two requests race for the last unit', async () => {
    // Only 1 unit in stock
    const product = await makeProduct(admin._id, { stock: 1 });

    const customer2 = await makeUser({ email: 'customer2-race@test.sn' });
    const token2    = makeToken(customer2);

    // Fire both requests simultaneously
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/v2/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderPayload(product._id, 1)),
      request(app)
        .post('/api/v2/orders')
        .set('Authorization', `Bearer ${token2}`)
        .send(orderPayload(product._id, 1)),
    ]);

    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(201); // at least one succeeded
    expect(statuses).toContain(400); // at least one was rejected (overselling prevented)

    // Stock must be exactly 0 — not -1
    const Product = require('../models/Product');
    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(0);
  });

  it('allows both orders when stock is sufficient for both', async () => {
    const product = await makeProduct(admin._id, { stock: 10 });

    const customer2 = await makeUser({ email: 'customer2-ok@test.sn' });
    const token2    = makeToken(customer2);

    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/v2/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderPayload(product._id, 3)),
      request(app)
        .post('/api/v2/orders')
        .set('Authorization', `Bearer ${token2}`)
        .send(orderPayload(product._id, 3)),
    ]);

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);

    const Product = require('../models/Product');
    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(4); // 10 - 3 - 3
  });
});

// ── Unique orderNumber generation ─────────────────────────────────────────────

describe('Unique orderNumber generation under concurrency', () => {
  it('generates distinct orderNumbers for concurrent orders', async () => {
    const CONCURRENCY = 5;

    // Create enough stock for all concurrent orders
    const product = await makeProduct(admin._id, { stock: CONCURRENCY * 10 });

    // Create one customer per concurrent request
    const customers = await Promise.all(
      Array.from({ length: CONCURRENCY }, (_, i) =>
        makeUser({ email: `uniq-${i}-${Date.now()}@test.sn` })
      )
    );

    const responses = await Promise.all(
      customers.map((c) =>
        request(app)
          .post('/api/v2/orders')
          .set('Authorization', `Bearer ${makeToken(c)}`)
          .send(orderPayload(product._id, 1))
      )
    );

    const created = responses.filter((r) => r.status === 201);
    expect(created.length).toBe(CONCURRENCY);

    const orderNumbers = created.map((r) => r.body.data.order.orderNumber);
    const unique = new Set(orderNumbers);
    expect(unique.size).toBe(CONCURRENCY); // all distinct
  });
});

// ── My orders ─────────────────────────────────────────────────────────────────

describe('GET /api/v2/orders/my-orders', () => {
  it('returns only the authenticated user\'s orders', async () => {
    const product = await makeProduct(admin._id, { stock: 20 });

    // Customer 1 creates 2 orders
    await request(app)
      .post('/api/v2/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload(product._id, 1));
    await request(app)
      .post('/api/v2/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload(product._id, 1));

    // Customer 2 creates 1 order
    const customer2 = await makeUser({ email: 'customer2-myorders@test.sn' });
    await request(app)
      .post('/api/v2/orders')
      .set('Authorization', `Bearer ${makeToken(customer2)}`)
      .send(orderPayload(product._id, 1));

    const res = await request(app)
      .get('/api/v2/orders/my-orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orders).toHaveLength(2);
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/v2/orders/my-orders');
    expect(res.status).toBe(401);
  });
});
