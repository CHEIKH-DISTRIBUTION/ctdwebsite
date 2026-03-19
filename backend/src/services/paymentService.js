const axios = require('axios');
const config = require('../config');
const Payment = require('../models/Payment');

// Configuration des APIs de paiement
const paymentConfig = {
  wave: {
    apiKey: config.WAVE_API_KEY,
    apiUrl: config.WAVE_API_URL,
    merchantId: config.WAVE_MERCHANT_ID
  },
  orangeMoney: {
    authUrl: config.ORANGE_MONEY_AUTH_URL,
    paymentUrl: config.ORANGE_MONEY_PAYMENT_URL,
    merchantKey: config.ORANGE_MONEY_MERCHANT_KEY
  },
  stripe: {
    secretKey: config.STRIPE_SECRET_KEY,
    webhookSecret: config.STRIPE_WEBHOOK_SECRET
  }
};

/**
 * Retry wrapper — retries once on network timeout (ECONNABORTED / ETIMEDOUT).
 */
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

// Wave Money
exports.initiateWavePayment = async ({ amount, phone, orderId, paymentId }) => {
  try {
    const response = await withRetry(() =>
      axios.post(`${paymentConfig.wave.apiUrl}/payments`, {
        amount: amount * 100, // Convertir en centimes
        currency: 'XOF',
        customer: {
          phone_number: phone.replace('+', '')
        },
        merchant_reference: orderId.toString(),
        metadata: {
          paymentId: paymentId.toString()
        }
      }, {
        headers: {
          Authorization: `Bearer ${paymentConfig.wave.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
      })
    );

    return {
      status: 'processing',
      transactionId: response.data.id,
      nextAction: response.data.payment_url // URL pour compléter le paiement
    };
  } catch (error) {
    console.error('Erreur Wave:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Échec de la requête Wave');
  }
};

// Orange Money
exports.initiateOrangeMoneyPayment = async ({ amount, phone, orderId, paymentId }) => {
  try {
    // 1. Obtenir le token d'authentification
    const authResponse = await withRetry(() =>
      axios.post(paymentConfig.orangeMoney.authUrl, {
        grant_type: 'client_credentials'
      }, {
        auth: {
          username: paymentConfig.orangeMoney.merchantKey,
          password: ''
        },
        timeout: 10000,
      })
    );

    // 2. Initier le paiement
    const paymentResponse = await withRetry(() =>
      axios.post(paymentConfig.orangeMoney.paymentUrl, {
        merchant_key: paymentConfig.orangeMoney.merchantKey,
        currency: 'XOF',
        order_id: orderId.toString(),
        amount: amount,
        return_url: `${config.CLIENT_URL}/payment/pending?paymentId=${paymentId}&orderId=${orderId}`,
        cancel_url: `${config.CLIENT_URL}/payment/cancel?orderId=${orderId}`,
        notification_url: `${config.BACKEND_URL}/api/payments/webhook/orange_money`,
        lang: 'fr',
        reference: paymentId.toString(),
        buyer_phone_number: phone.replace('+', '')
      }, {
        headers: {
          Authorization: `Bearer ${authResponse.data.access_token}`
        },
        timeout: 10000,
      })
    );

    return {
      status: 'processing',
      transactionId: paymentResponse.data.pay_token,
      nextAction: paymentResponse.data.payment_url
    };
  } catch (error) {
    console.error('Erreur Orange Money:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Échec de la requête Orange Money');
  }
};

// Stripe (cartes bancaires)
exports.processCardPayment = async ({ amount, cardDetails, email, orderId }) => {
  try {
    const stripe = require('stripe')(paymentConfig.stripe.secretKey);

    // Créer un PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // en centimes
      currency: 'xof',
      payment_method_types: ['card'],
      metadata: { orderId: orderId.toString() },
      receipt_email: email
    });

    // Confirmer le paiement côté client avec Stripe.js
    return {
      status: 'processing',
      transactionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    };
  } catch (error) {
    console.error('Erreur Stripe:', error.message);
    throw new Error(error.message);
  }
};

// ── Vérification des paiements ───────────────────────────────────────────────

exports.verifyWavePayment = async (transactionId) => {
  const response = await withRetry(() =>
    axios.get(`${paymentConfig.wave.apiUrl}/payments/${transactionId}`, {
      headers: { Authorization: `Bearer ${paymentConfig.wave.apiKey}` },
      timeout: 10000,
    })
  );

  return {
    status: response.data.status === 'SUCCESS' ? 'completed' : 'failed',
    processedAt: response.data.completed_at
  };
};

exports.verifyOrangeMoneyPayment = async (transactionId) => {
  // 1. Obtenir le token d'authentification
  const authResponse = await withRetry(() =>
    axios.post(paymentConfig.orangeMoney.authUrl, {
      grant_type: 'client_credentials'
    }, {
      auth: { username: paymentConfig.orangeMoney.merchantKey, password: '' },
      timeout: 10000,
    })
  );

  // 2. Vérifier le statut du paiement via pay_token
  const statusResponse = await withRetry(() =>
    axios.get(`${paymentConfig.orangeMoney.paymentUrl}/${transactionId}`, {
      headers: { Authorization: `Bearer ${authResponse.data.access_token}` },
      timeout: 10000,
    })
  );

  const data = statusResponse.data;
  let status = 'processing';
  if (data.status === 'SUCCESS' || data.status === 'SUCCESSFULL') status = 'completed';
  else if (data.status === 'FAILED' || data.status === 'EXPIRED') status = 'failed';

  return { status, processedAt: data.updated_at || null };
};

// ── Webhook handlers ─────────────────────────────────────────────────────────

/**
 * Process a Wave webhook payload.
 * Wave sends: { id, status, merchant_reference, metadata: { paymentId } }
 */
exports.handleWaveWebhook = async (payload) => {
  const transactionId = payload.id;
  const paymentId = payload.metadata?.paymentId;

  const payment = paymentId
    ? await Payment.findById(paymentId)
    : await Payment.findOne({ transactionId });

  if (!payment) {
    console.warn('[webhook:wave] Payment not found for', transactionId);
    return null;
  }

  if (payload.status === 'SUCCESS') {
    payment.status = 'completed';
    payment.processedAt = new Date();
  } else if (payload.status === 'FAILED' || payload.status === 'CANCELLED') {
    payment.status = 'failed';
    payment.errorMessage = payload.error || 'Paiement échoué';
  }

  payment.paymentDetails = { ...payment.paymentDetails, gatewayWebhook: payload };
  await payment.save();
  return payment;
};

/**
 * Process an Orange Money webhook payload.
 * Orange Money sends: { status, pay_token, txnid, order_id, reference }
 */
exports.handleOrangeMoneyWebhook = async (payload) => {
  const paymentId = payload.reference;
  const transactionId = payload.pay_token;

  const payment = paymentId
    ? await Payment.findById(paymentId)
    : await Payment.findOne({ transactionId });

  if (!payment) {
    console.warn('[webhook:orange_money] Payment not found for', transactionId);
    return null;
  }

  if (payload.status === 'SUCCESS' || payload.status === 'SUCCESSFULL') {
    payment.status = 'completed';
    payment.processedAt = new Date();
  } else if (payload.status === 'FAILED' || payload.status === 'EXPIRED') {
    payment.status = 'failed';
    payment.errorMessage = payload.message || 'Paiement échoué';
  }

  payment.paymentDetails = { ...payment.paymentDetails, gatewayWebhook: payload };
  await payment.save();
  return payment;
};

// ── Remboursements ───────────────────────────────────────────────────────────

exports.processWaveRefund = async (transactionId) => {
  // Wave Sénégal ne supporte pas le remboursement API automatique.
  // Le remboursement doit être effectué manuellement via le dashboard Wave Business.
  throw new Error('Remboursement Wave : veuillez effectuer le remboursement manuellement depuis le dashboard Wave Business');
};

exports.processOrangeMoneyRefund = async (transactionId) => {
  // Orange Money ne supporte pas le remboursement API automatique.
  throw new Error('Remboursement Orange Money : veuillez effectuer le remboursement manuellement');
};

exports.processCardRefund = async (transactionId) => {
  const stripe = require('stripe')(paymentConfig.stripe.secretKey);
  const refund = await stripe.refunds.create({
    payment_intent: transactionId,
  });
  return {
    status: refund.status === 'succeeded' ? 'refunded' : 'failed',
    refundId: refund.id,
  };
};