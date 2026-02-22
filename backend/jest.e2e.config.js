'use strict';

/**
 * Jest configuration for the end-to-end integration test suite.
 *
 * Key choices:
 *  - globalSetup/globalTeardown: start/stop a MongoMemoryReplSet (replica set
 *    required for MongoDB multi-document transactions).
 *  - setupFiles: runs envSetup.js in every worker BEFORE any module is
 *    imported, so MONGO_URI and JWT_SECRET are present when server.js loads.
 *  - --runInBand (passed via package.json script): keeps all tests in the same
 *    worker process, which shares the mongoose connection opened by server.js.
 *  - testTimeout: 60 s to account for replica set startup on slow machines.
 */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 60_000,

  globalSetup:    './src/__tests__/helpers/globalSetup.js',
  globalTeardown: './src/__tests__/helpers/globalTeardown.js',

  // setupFiles run synchronously before any module import in each worker.
  // This is where we push env vars so connectDB() gets the right URI.
  setupFiles: ['./src/__tests__/helpers/envSetup.js'],

  // setupFilesAfterEnv run after the test framework is installed.
  // dbSetup.js boots the app and waits for the Mongoose connection.
  setupFilesAfterEnv: ['./src/__tests__/helpers/dbSetup.js'],

  testMatch: ['**/src/__tests__/**/*.test.js'],

  // Mock external-dependency modules that aren't installed in dev
  moduleNameMapper: {
    // paymentService.js requires axios (not in devDependencies) and real API keys
    '^.*/services/paymentService$': '<rootDir>/src/__tests__/__mocks__/paymentService.js',
  },

  // Silence noisy console output from the app during tests
  silent: false,

  // Collect coverage from source files (optional — remove if slow)
  // collectCoverageFrom: ['src/**/*.js', '!src/__tests__/**'],
};
