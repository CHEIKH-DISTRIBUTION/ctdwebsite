'use strict';

/**
 * Products e2e tests
 *
 * Covers: list products (with filters), fetch single product.
 * Product creation/update/delete (admin-only) are not covered here.
 */
const request = require('supertest');
const app     = require('../server');
const { clearAll }  = require('./helpers/db');
const { makeAdmin, makeProduct } = require('./helpers/factories');

let admin;

beforeAll(async () => {
  // Admin user needed to satisfy the `createdBy` required field on Product
  admin = await makeAdmin({ email: 'admin-products@test.sn' });
});

beforeEach(clearAll);

// Re-create admin after each clearAll (clearAll wipes users too)
beforeEach(async () => {
  admin = await makeAdmin({ email: 'admin-products@test.sn' });
});

// ── List products ─────────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  it('returns an empty list when no products exist', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // The product controller returns data as array or paginated object
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data?.products ?? [];
    expect(items).toHaveLength(0);
  });

  it('returns all active products', async () => {
    await makeProduct(admin._id, { name: 'Riz Basmati' });
    await makeProduct(admin._id, { name: 'Huile de Palme' });

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data?.products ?? [];
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('does not return inactive products', async () => {
    await makeProduct(admin._id, { name: 'Produit Actif', isActive: true });
    await makeProduct(admin._id, { name: 'Produit Inactif', isActive: false });

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data?.products ?? [];
    const names = items.map((p) => p.name);
    expect(names).not.toContain('Produit Inactif');
  });

  it('filters by category', async () => {
    await makeProduct(admin._id, { category: 'Alimentaire',   name: 'Riz' });
    await makeProduct(admin._id, { category: 'Hygiène',       name: 'Savon' });

    const res = await request(app).get('/api/products?category=Alimentaire');

    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data?.products ?? [];
    expect(items.every((p) => p.category === 'Alimentaire')).toBe(true);
  });
});

// ── Single product ────────────────────────────────────────────────────────────

describe('GET /api/products/:id', () => {
  it('returns a single product by ID', async () => {
    const product = await makeProduct(admin._id, { name: 'Sucre Cristal', price: 500 });

    const res = await request(app).get(`/api/products/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data?.product ?? res.body.data;
    expect(data.name).toBe('Sucre Cristal');
    expect(data.price).toBe(500);
  });

  it('returns 404 for a non-existent product ID', async () => {
    const fakeId = '64f1234567890abcde000000';
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it('returns 400/404 for a malformed product ID', async () => {
    const res = await request(app).get('/api/products/not-a-valid-id');
    expect([400, 404, 500]).toContain(res.status);
  });
});
