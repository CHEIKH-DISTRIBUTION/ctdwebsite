'use strict';

const jwt   = require('jsonwebtoken');
const User  = require('../models/User');
const audit = require('../infrastructure/logger/auditLogger');

// ── protect ────────────────────────────────────────────────────────────────
// Verifies the short-lived JWT access token sent as "Authorization: Bearer <token>".
// Attaches the full user document to req.user on success.
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Accès non autorisé, token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Token invalide' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }

    req.user = user;
    next();
  } catch {
    // Do not leak token-verification error details
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

// ── authorize ──────────────────────────────────────────────────────────────
// Role-based access control. Must be used AFTER protect.
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Audit log: role access denied
      audit.log({
        action:  'role_denied',
        userId:  req.user?._id,
        req,
        success: false,
        details: { required: roles, actual: req.user?.role, path: req.path },
      });

      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    next();
  };
};

// ── optionalAuth ───────────────────────────────────────────────────────────
// Soft auth: attaches user if valid token is present, continues regardless.
exports.optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer')) {
      const token   = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      if (user?.isActive) req.user = user;
    }
  } catch {
    // Silent — token invalid or absent
  }
  next();
};
