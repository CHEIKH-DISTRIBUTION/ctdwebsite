'use strict';

/**
 * Webhook signature verification tests
 *
 * Covers:
 *  - POST /api/payments/webhook/wave
 *  - POST /api/payments/webhook/orange_money
 *
 * The webhook route is public (no JWT required) and uses HMAC-SHA256
 * to authenticate incoming callbacks from payment providers.
 *
 * Expected behaviour:
 *  - Valid HMAC signature   → 400 (signature accepted; further processing fails
 *    because handleWaveWebhook/handleOrangeMoneyWebhook are not yet implemented,
 *    so the catch block returns 400)
 *  - Invalid HMAC signature → 401 (rejected by verifyHmacSignature)
 *  - Missing signature      → 401 (rejected by verifyHmacSignature)
 *  - Unknown provider       → 400 (default case in the switch)
 */
const request = require('supertest');
const crypto  = require('crypto');
const app     = require('../server');

// Secrets are set in envSetup.js
const WAVE_SECRET   = process.env.WAVE_API_SECRET   ?? 'test-wave-secret';
const ORANGE_SECRET = process.env.ORANGE_MONEY_API_SECRET ?? 'test-orange-secret';

/**
 * Compute the HMAC-SHA256 hex digest of `body` using `secret`.
 * Mirrors the logic inside paymentController.verifyHmacSignature.
 */
function sign(body, secret) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

const samplePayload = JSON.stringify({ event: 'payment.completed', orderId: 'ORD001' });

// ── Wave webhook ──────────────────────────────────────────────────────────────

describe('POST /api/payments/webhook/wave', () => {
  it('accepts a valid HMAC-SHA256 signature (no 401)', async () => {
    const signature = sign(samplePayload, WAVE_SECRET);

    const res = await request(app)
      .post('/api/payments/webhook/wave')
      .set('Content-Type', 'application/json')
      .set('X-Wave-Signature', signature)
      .send(samplePayload);

    // Signature check passes → processing continues and fails internally → 400
    // (NOT 401 which would mean the signature was rejected)
    expect(res.status).not.toBe(401);
  });

  it('rejects an invalid signature with 401', async () => {
    const res = await request(app)
      .post('/api/payments/webhook/wave')
      .set('Content-Type', 'application/json')
      .set('X-Wave-Signature', 'deadbeefdeadbeef')
      .send(samplePayload);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid signature/i);
  });

  it('rejects a missing signature with 401', async () => {
    const res = await request(app)
      .post('/api/payments/webhook/wave')
      .set('Content-Type', 'application/json')
      .send(samplePayload);

    expect(res.status).toBe(401);
  });

  it('rejects a signature computed with the wrong secret', async () => {
    const wrongSignature = sign(samplePayload, 'wrong-secret');

    const res = await request(app)
      .post('/api/payments/webhook/wave')
      .set('Content-Type', 'application/json')
      .set('X-Wave-Signature', wrongSignature)
      .send(samplePayload);

    expect(res.status).toBe(401);
  });

  it('rejects a signature for a different body (replay/tamper)', async () => {
    // Sign the original payload but send a tampered one
    const validSignature  = sign(samplePayload, WAVE_SECRET);
    const tamperedPayload = JSON.stringify({ event: 'payment.completed', orderId: 'EVIL' });

    const res = await request(app)
      .post('/api/payments/webhook/wave')
      .set('Content-Type', 'application/json')
      .set('X-Wave-Signature', validSignature)
      .send(tamperedPayload);

    expect(res.status).toBe(401);
  });
});

// ── Orange Money webhook ──────────────────────────────────────────────────────

describe('POST /api/payments/webhook/orange_money', () => {
  it('accepts a valid HMAC-SHA256 signature (no 401)', async () => {
    const signature = sign(samplePayload, ORANGE_SECRET);

    const res = await request(app)
      .post('/api/payments/webhook/orange_money')
      .set('Content-Type', 'application/json')
      .set('X-Orange-Signature', signature)
      .send(samplePayload);

    expect(res.status).not.toBe(401);
  });

  it('rejects an invalid signature with 401', async () => {
    const res = await request(app)
      .post('/api/payments/webhook/orange_money')
      .set('Content-Type', 'application/json')
      .set('X-Orange-Signature', 'badsignature123')
      .send(samplePayload);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid signature/i);
  });

  it('rejects a missing signature with 401', async () => {
    const res = await request(app)
      .post('/api/payments/webhook/orange_money')
      .set('Content-Type', 'application/json')
      .send(samplePayload);

    expect(res.status).toBe(401);
  });
});

// ── Cross-provider isolation ──────────────────────────────────────────────────

describe('Cross-provider signature isolation', () => {
  it('rejects a Wave signature sent to the Orange Money endpoint', async () => {
    // Sign with Wave secret but send to orange_money endpoint
    const waveSignature = sign(samplePayload, WAVE_SECRET);

    const res = await request(app)
      .post('/api/payments/webhook/orange_money')
      .set('Content-Type', 'application/json')
      .set('X-Orange-Signature', waveSignature) // wrong secret for this provider
      .send(samplePayload);

    expect(res.status).toBe(401);
  });
});

// ── Unknown provider ──────────────────────────────────────────────────────────

describe('POST /api/payments/webhook/unknown_provider', () => {
  it('returns 400 for an unrecognised provider', async () => {
    const res = await request(app)
      .post('/api/payments/webhook/paypal')
      .set('Content-Type', 'application/json')
      .send(samplePayload);

    // Unknown provider falls through the switch → 400
    expect(res.status).toBe(400);
  });
});
