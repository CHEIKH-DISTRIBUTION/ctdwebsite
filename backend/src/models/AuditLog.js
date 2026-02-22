'use strict';

const mongoose = require('mongoose');

/**
 * AuditLog — append-only audit trail for security-sensitive events.
 *
 * Auto-expires after 90 days via TTL index.
 */
const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type:     String,
      required: true,
      enum: [
        'login',
        'login_failed',
        'register',
        'logout',
        'token_refresh',
        'password_reset_request',
        'password_reset',
        'google_auth',
        'facebook_auth',
        'captcha_failed',
        'role_denied',
        'order_created',
      ],
      index: true,
    },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    email:     { type: String, default: null },
    ip:        { type: String, default: null },
    userAgent: { type: String, default: '' },
    success:   { type: Boolean, required: true },
    details:   { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Auto-delete logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
