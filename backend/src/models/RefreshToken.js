'use strict';

const mongoose = require('mongoose');

/**
 * RefreshToken — persisted refresh token store.
 *
 * Only the SHA-256 hash of the plain token is stored; the plain token
 * is only ever sent to the client once (as an httpOnly cookie) and is
 * never readable from the database.
 *
 * Each login/register creates one document.
 * Each successful refresh rotates: old doc is revoked, new one created.
 * MongoDB TTL index cleans up expired rows automatically.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    tokenHash: {
      type:     String,
      required: true,
      unique:   true,
    },
    expiresAt: {
      type:     Date,
      required: true,
    },
    isRevoked: {
      type:    Boolean,
      default: false,
      index:   true,
    },
    userAgent: { type: String, default: '' },
    ip:        { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-delete expired tokens (MongoDB TTL index)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
