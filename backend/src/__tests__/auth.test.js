'use strict';

/**
 * Auth e2e tests
 *
 * Covers: register, login, get-me, forgot-password, reset-password
 */
const request = require('supertest');
const crypto  = require('crypto');
const app     = require('../server');
const { clearAll } = require('./helpers/db');
const { makeUser, makeToken } = require('./helpers/factories');

beforeEach(clearAll);

// ── Registration ──────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const validPayload = {
    name:     'Fatou Diallo',
    email:    'fatou@test.sn',
    password: 'secret123',
    phone:    '771234567',
  };

  it('registers a new user and returns a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe('fatou@test.sn');
    expect(res.body.data.user.role).toBe('customer');
    // Password must never be returned
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects duplicate email with 400', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'only@email.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects an invalid phone number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, phone: '12345' });

    expect(res.status).toBe(400);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await makeUser({ email: 'amadou@test.sn', password: 'password123' });
  });

  it('logs in with correct credentials and returns a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amadou@test.sn', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe('amadou@test.sn');
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amadou@test.sn', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.sn', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('rejects missing credentials with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ── Get me ────────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns the authenticated user profile', async () => {
    const user  = await makeUser({ email: 'marieme@test.sn' });
    const token = makeToken(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('marieme@test.sn');
    expect(res.body.data.password).toBeUndefined();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a tampered token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.jwt.token');

    expect(res.status).toBe(401);
  });
});

// ── Forgot password ───────────────────────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 for an existing email (email enumeration prevention)', async () => {
    await makeUser({ email: 'existing@test.sn' });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'existing@test.sn' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 200 even for a non-existing email (no leak)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ghost@test.sn' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when email is omitted', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ── Reset password ────────────────────────────────────────────────────────────

describe('POST /api/auth/reset-password/:token', () => {
  it('resets password with a valid token and auto-logs in', async () => {
    const User = require('../models/User');

    const user = await makeUser({ email: 'reset@test.sn' });

    // Simulate a valid reset token (same logic as authController.forgotPassword)
    const plainToken  = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const res = await request(app)
      .post(`/api/auth/reset-password/${plainToken}`)
      .send({ password: 'newpassword456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();

    // Verify old password no longer works
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reset@test.sn', password: 'password123' });
    expect(loginRes.status).toBe(401);

    // Verify new password works
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reset@test.sn', password: 'newpassword456' });
    expect(newLoginRes.status).toBe(200);
  });

  it('rejects an invalid or expired token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/deadbeefdeadbeef')
      .send({ password: 'newpassword456' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/sometoken')
      .send({ password: '123' });

    expect(res.status).toBe(400);
  });
});
