'use strict';

/**
 * Jest setupFilesAfterEnv — runs after the test framework is installed,
 * once per worker, before any test file's own beforeAll/beforeEach.
 *
 * Responsibilities:
 *  1. Import server.js (triggers connectDB() and mounts all routes)
 *  2. Wait for the Mongoose connection to be fully ready
 *  3. (Nothing to do on teardown — --forceExit handles open handles)
 */
const mongoose = require('mongoose');

// Importing server.js triggers connectDB() as a side effect.
// The module is cached by Node, so subsequent requires in test files are free.
require('../../server');

beforeAll(async () => {
  // readyState 1 = connected, 2 = connecting
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Mongoose failed to connect within 30 s')),
        30_000
      );

      mongoose.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve();
      });

      mongoose.connection.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }
}, 35_000);
