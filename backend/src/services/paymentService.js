const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');
const Payment = require('../models/Payment');

/**
 * Payment Service — Wave (direct API) + Orange Money (via PayTech)
 *
 * Wave API docs:  https://docs.wave.com/business
 * PayTech docs:   https://docs.intech.sn/doc_paytech.php
 */

// ── Retry wrapper ───────────────────────────────────────────────────────────

async function withRetry(fn, retries = 1) {
  try {
    return await fn();
  } catch (err) {
    const isTimeout = err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT';
    if (isTimeout && retries > 0) {
      console.warn(`[payment] Timeout — retrying (${retries} left)`);
      return withRetry(fn, retries - 1);
    }
    throw err;
  }
}

// ── Wave (direct API) ───────────────────────────────────────────────────────

/**
 * Create a Wave checkout session.
 * POST https://api.wave.com/v1/checkout/sessions
 *
 * ⚠️ `amount` must be a string, not a number.
 * Returns a `wave_launch_url` to redirect the customer to.
 */
exports.initiateWavePayment = async ({ amount, orderId, paymentId }) => {
  try {
    const response = await withRetry(() =>
      axios.post(`${config.WAVE_API_URL}/checkout/sessions`, {
        amount: String(amount),   // Wave requires string
        currency: 'XOF',
        client_reference: orderId.toString(),
        success_url: `${config.CLIENT_URL}/payment/pending?paymentId=${paymentId}&orderId=${orderId}&method=wave`,
        error_url: `${config.CLIENT_URL}/payment/cancel?orderId=${orderId}`,
      }, {
        headers: {
          Authorization: `Bearer ${config.WAVE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      })
    );

    return {
      status: 'processing',
      transactionId: response.data.id,            // cos-xxx
      nextAction: response.data.wave_launch_url,   // redirect URL
    };
  } catch (error) {
    console.error('Erreur Wave:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Échec de la requête Wave');
  }
};

/**
 * Check Wave checkout session status.
 * GET https://api.wave.com/v1/checkout/sessions/:id
 */
exports.verifyWavePayment = async (transactionId) => {
  const response = await withRetry(() =>
    axios.get(`${config.WAVE_API_URL}/checkout/sessions/${transactionId}`, {
      headers: { Authorization: `Bearer ${config.WAVE_API_KEY}` },
      timeout: 10000,
    })
  );

  const status = response.data.checkout_status;
  let mapped = 'processing';
  if (status === 'complete') mapped = 'completed';
  else if (status === 'expired' || status === 'error') mapped = 'failed';

  return { status: mapped, processedAt: response.data.when_completed || null };
};

/**
 * Handle Wave webhook payload.
 * Wave sends: { type: "checkout.session.completed", data: { id, client_reference, checkout_status } }
 */
exports.handleWaveWebhook = async (payload) => {
  const type = payload.type;
  const data = payload.data || {};
  const transactionId = data.id;
  const clientRef = data.client_reference;

  // Find payment by transactionId or by order reference
  let payment = await Payment.findOne({ transactionId });
  if (!payment && clientRef) {
    payment = await Payment.findOne({ order: clientRef });
  }

  if (!payment) {
    console.warn('[webhook:wave] Payment not found for', transactionId);
    return null;
  }

  if (type === 'checkout.session.completed' && data.checkout_status === 'complete') {
    payment.status = 'completed';
    payment.processedAt = new Date();
  } else if (data.checkout_status === 'expired' || data.checkout_status === 'error') {
    payment.status = 'failed';
    payment.errorMessage = data.last_error || 'Paiement échoué';
  }

  payment.paymentDetails = { ...payment.paymentDetails, gatewayWebhook: payload };
  await payment.save();
  return payment;
};

// ── Orange Money (via PayTech) ──────────────────────────────────────────────

/**
 * Initiate an Orange Money payment via PayTech.
 * POST https://paytech.sn/api/payment/request-payment
 */
exports.initiateOrangeMoneyPayment = async ({ amount, orderId, paymentId }) => {
  try {
    const response = await withRetry(() =>
      axios.post('https://paytech.sn/api/payment/request-payment', {
        item_name: `Commande ${orderId}`,
        item_price: Math.round(amount),   // integer XOF, no decimals
        currency: 'XOF',
        ref_command: paymentId.toString(),
        ipn_url: `${config.BACKEND_URL}/api/payments/webhook/orange_money`,
        success_url: `${config.CLIENT_URL}/payment/pending?paymentId=${paymentId}&orderId=${orderId}&method=orange_money`,
        cancel_url: `${config.CLIENT_URL}/payment/cancel?orderId=${orderId}`,
        env: config.NODE_ENV === 'production' ? 'prod' : 'test',
        custom_field: JSON.stringify({ orderId: orderId.toString(), paymentId: paymentId.toString() }),
      }, {
        headers: {
          'API_KEY': config.PAYTECH_API_KEY,
          'API_SECRET': config.PAYTECH_API_SECRET,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      })
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'PayTech a refusé la requête');
    }

    return {
      status: 'processing',
      transactionId: response.data.token,
      nextAction: response.data.redirect_url,
    };
  } catch (error) {
    console.error('Erreur Orange Money (PayTech):', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Échec de la requête Orange Money');
  }
};

/**
 * Verify Orange Money payment status via PayTech.
 */
exports.verifyOrangeMoneyPayment = async (transactionId) => {
  const response = await withRetry(() =>
    axios.get(`https://paytech.sn/api/payment/get-status?token_payment=${transactionId}`, {
      headers: {
        'API_KEY': config.PAYTECH_API_KEY,
        'API_SECRET': config.PAYTECH_API_SECRET,
      },
      timeout: 10000,
    })
  );

  const data = response.data;
  let status = 'processing';
  if (data.status === 'completed' || data.status === 'success') status = 'completed';
  else if (data.status === 'canceled' || data.status === 'expired') status = 'failed';

  return { status, processedAt: data.updated_at || null };
};

/**
 * Handle PayTech IPN webhook (for Orange Money).
 * PayTech sends: { type_event, ref_command, token, payment_method, api_key_sha256, ... }
 */
exports.handleOrangeMoneyWebhook = async (payload) => {
  // Verify authenticity: hash of our API key must match
  const expectedKeyHash = crypto
    .createHash('sha256')
    .update(config.PAYTECH_API_KEY || '')
    .digest('hex');

  if (payload.api_key_sha256 !== expectedKeyHash) {
    console.warn('[webhook:paytech] Invalid api_key_sha256 — rejected');
    return null;
  }

  const paymentId = payload.ref_command;
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    console.warn('[webhook:paytech] Payment not found for ref_command', paymentId);
    return null;
  }

  // Idempotent: skip if already completed
  if (payment.status === 'completed') return payment;

  if (payload.type_event === 'sale_complete') {
    payment.status = 'completed';
    payment.transactionId = payload.token;
    payment.processedAt = new Date();
  }

  payment.paymentDetails = { ...payment.paymentDetails, gatewayWebhook: payload };
  await payment.save();
  return payment;
};

// ── Remboursements ──────────────────────────────────────────────────────────

exports.processWaveRefund = async () => {
  throw new Error(
    'Remboursement Wave : veuillez effectuer le remboursement manuellement depuis le dashboard Wave Business'
  );
};

exports.processOrangeMoneyRefund = async () => {
  throw new Error(
    'Remboursement Orange Money : veuillez effectuer le remboursement manuellement'
  );
};
