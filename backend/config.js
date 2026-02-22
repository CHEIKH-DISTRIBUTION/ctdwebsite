require('dotenv').config(); // Charge les variables d'environnement

module.exports = {
  // Configuration générale
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',

  // Base de données
  DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/cheikh-distribution',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'votreSecretParDefaut',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

  // Paiements - Wave
  WAVE_API_KEY: process.env.WAVE_API_KEY,
  WAVE_API_URL: process.env.WAVE_API_URL || 'https://api.wave.com/v1',
  WAVE_MERCHANT_ID: process.env.WAVE_MERCHANT_ID,
  WAVE_WEBHOOK_SECRET: process.env.WAVE_WEBHOOK_SECRET,

  // Paiements - Orange Money
  ORANGE_MONEY_MERCHANT_KEY: process.env.ORANGE_MONEY_MERCHANT_KEY,
  ORANGE_MONEY_AUTH_URL: process.env.ORANGE_MONEY_AUTH_URL || 'https://api.orange.com/oauth/v2/token',
  ORANGE_MONEY_PAYMENT_URL: process.env.ORANGE_MONEY_PAYMENT_URL || 'https://api.orange.com/orange-money-webpay/dev/v1/webpayment',
  ORANGE_WEBHOOK_SECRET: process.env.ORANGE_WEBHOOK_SECRET,

  // Paiements - Stripe (cartes bancaires)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // Email (exemple)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@cheikh-distribution.com'
};