const axios = require('axios');
const config = require('../config');

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

// Wave Money
exports.initiateWavePayment = async ({ amount, phone, orderId, paymentId }) => {
  try {
    const response = await axios.post(`${paymentConfig.wave.apiUrl}/payments`, {
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
    });

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
    const authResponse = await axios.post(paymentConfig.orangeMoney.authUrl, {
      grant_type: 'client_credentials'
    }, {
      auth: {
        username: paymentConfig.orangeMoney.merchantKey,
        password: ''
      },
      timeout: 10000,
    });

    // 2. Initier le paiement
    const paymentResponse = await axios.post(paymentConfig.orangeMoney.paymentUrl, {
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
      }
    });

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

// Vérification des paiements (simplifiée)
exports.verifyWavePayment = async (transactionId) => {
  const response = await axios.get(`${paymentConfig.wave.apiUrl}/payments/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${paymentConfig.wave.apiKey}`
    }
  });

  return {
    status: response.data.status === 'SUCCESS' ? 'completed' : 'failed',
    processedAt: response.data.completed_at
  };
};

exports.verifyOrangeMoneyPayment = async (transactionId) => {
  // Implémentation similaire pour Orange Money
  // ...
};