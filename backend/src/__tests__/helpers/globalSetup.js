'use strict';

/**
 * Jest globalSetup — runs once in the main process before any test suite.
 *
 * Starts a single-node MongoDB replica set (required for multi-document
 * transactions) and writes the connection URI to a temp file so that
 * worker processes can read it via envSetup.js (setupFiles).
 */
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const URI_FILE = path.join(os.tmpdir(), 'cheikh-test-mongo-uri.txt');

module.exports = async function globalSetup() {
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });

  // Store the instance on `global` so globalTeardown can stop it
  global.__MONGO_REPLSET__ = replSet;

  const uri = replSet.getUri();

  // Write URI to temp file — worker processes don't share `global`
  fs.writeFileSync(URI_FILE, uri, 'utf8');
};
