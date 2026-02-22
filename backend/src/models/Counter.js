'use strict';

const mongoose = require('mongoose');

/**
 * Counter — atomic sequence generator using findOneAndUpdate + $inc.
 *
 * Each document represents a named counter (e.g. "orders-260222" for
 * the orders on 2026-02-22). The `seq` field is incremented atomically,
 * which eliminates the race condition that exists with countDocuments+1.
 *
 * Usage:
 *   const { seq } = await Counter.findOneAndUpdate(
 *     { _id: 'orders-260222' },
 *     { $inc: { seq: 1 } },
 *     { upsert: true, new: true }
 *   );
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "orders-260222"
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
