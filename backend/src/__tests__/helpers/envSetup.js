'use strict';

/**
 * Jest setupFiles — runs synchronously in each worker BEFORE any module import.
 *
 * This is the only safe place to set process.env values that affect module
 * initialisation (e.g. connectDB reads MONGO_URI when server.js is first
 * required).  Using setupFilesAfterFramework would be too late.
 */
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const URI_FILE = path.join(os.tmpdir(), 'cheikh-test-mongo-uri.txt');

const uri = fs.readFileSync(URI_FILE, 'utf8').trim();

process.env.MONGO_URI   = uri;
process.env.NODE_ENV    = 'test';
process.env.JWT_SECRET  = 'cheikh-test-jwt-secret-32chars-ok';
process.env.JWT_EXPIRE  = '1d';
process.env.CLIENT_URL  = 'http://localhost:3000';
process.env.PORT        = '5001'; // avoid conflict with a running dev server

// Webhook HMAC secrets used in webhook.test.js
process.env.WAVE_API_SECRET         = 'test-wave-secret';
process.env.ORANGE_MONEY_API_SECRET = 'test-orange-secret';

// Leave EMAIL_* unset so the email service prints to console and never errors
