'use strict';

/**
 * Database test utilities.
 *
 * clearAll() deletes every document from every collection so each test
 * starts with a clean slate.  Call it in a beforeEach / afterEach hook.
 */
const mongoose = require('mongoose');

async function clearAll() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

module.exports = { clearAll };
