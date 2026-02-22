'use strict';

const AuditLog = require('../../models/AuditLog');

/**
 * auditLogger — fire-and-forget structured audit logging.
 *
 * All failures are swallowed; logging must never crash the request.
 *
 * @param {object} opts
 * @param {string}  opts.action    — AuditLog.action enum value
 * @param {string}  [opts.userId]  — Mongoose ObjectId (as string or ObjectId)
 * @param {string}  [opts.email]   — email address involved
 * @param {object}  opts.req       — Express request (for ip / user-agent)
 * @param {boolean} opts.success
 * @param {object}  [opts.details] — arbitrary extra context
 */
async function log({ action, userId = null, email = null, req, success, details = {} }) {
  try {
    const ip        = req?.ip || req?.headers?.['x-forwarded-for'] || null;
    const userAgent = req?.headers?.['user-agent'] || '';

    await AuditLog.create({ action, userId, email, ip, userAgent, success, details });
  } catch (err) {
    // Audit logging must never surface as an application error
    console.error('[audit] write failed:', err.message);
  }
}

module.exports = { log };
