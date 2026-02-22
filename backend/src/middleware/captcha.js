'use strict';

const axios  = require('axios');
const audit  = require('../infrastructure/logger/auditLogger');

/**
 * verifyCaptcha — Cloudflare Turnstile server-side verification middleware.
 *
 * Enabled only when TURNSTILE_SECRET_KEY is set in environment.
 * When not set (local development), all requests pass through automatically.
 *
 * Expected request body field: `cf-turnstile-response`
 *
 * On failure → 400, no details revealed.
 * On Turnstile service error → fail-open (allow) to protect UX.
 */
const verifyCaptcha = async (req, res, next) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Development bypass: if no secret key is configured, skip CAPTCHA
  if (!secretKey) return next();

  const token = req.body?.['cf-turnstile-response'];

  if (!token) {
    audit.log({ action: 'captcha_failed', req, success: false, details: { reason: 'missing_token' } });
    return res.status(400).json({
      success: false,
      message: 'Vérification de sécurité requise',
    });
  }

  try {
    const params = new URLSearchParams({
      secret:   secretKey,
      response: token,
      remoteip: req.ip || '',
    });

    const { data } = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 }
    );

    if (!data.success) {
      audit.log({
        action:  'captcha_failed',
        req,
        success: false,
        details: { 'error-codes': data['error-codes'] ?? [] },
      });
      return res.status(400).json({
        success: false,
        message: 'Vérification de sécurité échouée',
      });
    }

    next();
  } catch (err) {
    // Turnstile service unavailable → fail-open to avoid blocking legitimate users
    console.error('[captcha] Turnstile service error:', err.message);
    next();
  }
};

module.exports = { verifyCaptcha };
