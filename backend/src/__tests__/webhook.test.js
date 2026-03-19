'use strict';

/**
 * Webhook signature verification tests
 *
 * Covers:
 *  - POST /api/payments/webhook/wave
 *  - POST /api/payments/webhook/orange_money
 *
 * Wave:
 *  - Controller verifies HMAC-SHA256 via `Wave-Signature` header
 *  - Valid signature → processing (may 400 if payment not found, but NOT 401)
 *  - Invalid / missing signature → 401
 *
 * Orange Money (PayTech):
 *  - No HMAC header — PayTech sends `api_key_sha256` in the body
 *  - Verification happens inside handleOrangeMoneyWebhook (service layer)
 *  - Controller always lets the request through to the service
 */
const request = require('supertest');
const crypto  = require('crypto');
const app     = require('../server');

// Secrets are set in envSetup.js
const WAVE_SECRET = process.env.WAVE_API_SECRET ?? 'test-wave-secret';

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
      .set('Wave-Signature', signature)
      .send(samplePayload);

    // Signature check passes → processing continues and fails internally → 400
    // (NOT 401 which would mean the signature was rejected)
    expect(res.status).not.toBe(401);
  });

  it('rejects an invalid signature with 401', async () => {
    const res = await request(app)
      .post('/api/payments/webhook/wave')
      .set('Content-Type', 'application/json')
      .set('Wave-Signature', 'deadbeefdeadbeef')
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
      .set('Wave-Signature', wrongSignature)
      .send(samplePayload);

    expect(res.status).toBe(401);
  });

  it('rejects a signature for a different body (replay/tamper)', async () => {
    const validSignature  = sign(samplePayload, WAVE_SECRET);
    const tamperedPayload = JSON.stringify({ event: 'payment.completed', orderId: 'EVIL' });

    const res = await request(app)
      .post('/api/payments/webhook/wave')
      .set('Content-Type', 'application/json')
      .set('Wave-Signature', validSignature)
      .send(tamperedPayload);

    expect(res.status).toBe(401);
  });
});

// ── Orange Money webhook (PayTech) ────────────────────────────────────────────
// PayTech uses api_key_sha256 in the payload body, verified by the service layer.
// The controller does NOT check any HMAC header for Orange Money.

describe('POST /api/payments/webhook/orange_money', () => {
  it('passes through to service (no 401 from controller)', async () => {
    // PayTech sends api_key_sha256 in the body — the service rejects bad hashes.
    // At the controller level, the request should not be rejected with 401.
    const paytechPayload = JSON.stringify({
      type_event: 'sale_complete',
      ref_command: 'FAKE_PAYMENT_ID',
      token: 'tok_123',
      api_key_sha256: 'some_hash',
    });

    const res = await request(app)
      .post('/api/payments/webhook/orange_money')
      .set('Content-Type', 'application/json')
      .send(paytechPayload);

    // Should NOT be 401 — controller doesn't verify signature for PayTech
    expect(res.status).not.toBe(401);
  });

  it('returns 400 when handleOrangeMoneyWebhook rejects invalid api_key_sha256', async () => {
    const paytechPayload = JSON.stringify({
      type_event: 'sale_complete',
      ref_command: 'NONEXISTENT',
      token: 'tok_bad',
      api_key_sha256: 'definitely_wrong_hash',
    });

    const res = await request(app)
      .post('/api/payments/webhook/orange_money')
      .set('Content-Type', 'application/json')
      .send(paytechPayload);

    // Service rejects → returns null → controller responds 400
    expect(res.status).toBe(400);
  });
});

// ── Unknown provider ──────────────────────────────────────────────────────────

describe('POST /api/payments/webhook/unknown_provider', () => {
  it('returns 400 for an unrecognised provider', async () => {
    const res = await request(app)
      .post('/api/payments/webhook/paypal')
      .set('Content-Type', 'application/json')
      .send(samplePayload);

    expect(res.status).toBe(400);
  });
});
