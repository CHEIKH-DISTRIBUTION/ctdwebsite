'use strict';

module.exports = {
  // Only run real test files (*.test.js) inside src/__tests__/
  testMatch: ['<rootDir>/src/__tests__/**/*.test.js'],

  // Exclude helpers, mocks, and legacy test directory
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/helpers/',
    '/src/__tests__/__mocks__/',
    '/src/tests/',
  ],

  // MongoMemoryReplSet lifecycle
  globalSetup: './src/__tests__/helpers/globalSetup.js',
  globalTeardown: './src/__tests__/helpers/globalTeardown.js',

  // Env vars (reads URI from temp file) → runs in each worker before modules
  setupFiles: ['./src/__tests__/helpers/envSetup.js'],

  // DB connection (imports server.js) → runs after Jest is ready
  setupFilesAfterEnv: ['./src/__tests__/helpers/dbSetup.js'],

  // Run sequentially — parallel workers cause flaky failures with shared
  // MongoMemoryReplSet (ECONNRESET, race conditions on clearAll)
  maxWorkers: 1,

  // Give tests up to 30s (MongoDB startup can be slow)
  testTimeout: 30000,

  // Force exit to avoid open handle warnings from Mongoose
  forceExit: true,
};
