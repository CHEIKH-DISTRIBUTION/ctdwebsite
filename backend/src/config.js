// Configuration centralisée des variables d'environnement
module.exports = {
  // Payment Gateway Keys
  WAVE_API_KEY: process.env.WAVE_API_KEY || '',
  WAVE_API_URL: process.env.WAVE_API_URL || 'https://api.wave.com/v1',
  WAVE_MERCHANT_ID: process.env.WAVE_MERCHANT_ID || '',

  ORANGE_MONEY_AUTH_URL: process.env.ORANGE_MONEY_AUTH_URL || '',
  ORANGE_MONEY_PAYMENT_URL: process.env.ORANGE_MONEY_PAYMENT_URL || '',
  ORANGE_MONEY_MERCHANT_KEY: process.env.ORANGE_MONEY_MERCHANT_KEY || '',

  PAYTECH_API_KEY: process.env.PAYTECH_API_KEY || '',
  PAYTECH_API_SECRET: process.env.PAYTECH_API_SECRET || '',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cheikh_distribution',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',

  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',

  // Upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5242880, // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads'
};
