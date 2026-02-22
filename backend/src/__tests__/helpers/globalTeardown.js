'use strict';

/**
 * Jest globalTeardown — runs once in the main process after all test suites.
 *
 * Stops the MongoMemoryReplSet and removes the temp URI file.
 */
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const URI_FILE = path.join(os.tmpdir(), 'cheikh-test-mongo-uri.txt');

module.exports = async function globalTeardown() {
  if (global.__MONGO_REPLSET__) {
    await global.__MONGO_REPLSET__.stop();
  }
  try {
    fs.unlinkSync(URI_FILE);
  } catch {
    // file already gone — no problem
  }
};
