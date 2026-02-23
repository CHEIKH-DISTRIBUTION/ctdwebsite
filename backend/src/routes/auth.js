'use strict';

const express    = require('express');
const rateLimit  = require('express-rate-limit');
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  googleAuth,
  facebookAuth,
} = require('../controllers/authController');
const { protect }              = require('../middleware/auth');
const { verifyCaptcha }        = require('../middleware/captcha');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
}                              = require('../middleware/validation');

const router = express.Router();

// ── Rate limiters ──────────────────────────────────────────────────────────

/** Auth routes (register / login / forgot-password): 10 attempts / IP / 15 min */
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             process.env.NODE_ENV === 'production' ? 10 : 200,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

/** Password reset / refresh: 5 attempts / IP / 15 min */
const strictLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             process.env.NODE_ENV === 'production' ? 5 : 200,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

// ── Public routes ──────────────────────────────────────────────────────────

// Registration — CAPTCHA required, always creates role=customer
router.post('/register', authLimiter, verifyCaptcha, validateRegister, register);

// Login — CAPTCHA required
router.post('/login', authLimiter, verifyCaptcha, validateLogin, login);

// Token refresh — reads httpOnly refresh cookie, issues new access token
router.post('/refresh', strictLimiter, refreshToken);

// Logout — revokes refresh token from cookie (public: works even if access token expired)
router.post('/logout', logout);

// Password reset flow — CAPTCHA on forgot-password to prevent email flooding
router.post('/forgot-password', authLimiter, verifyCaptcha, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', strictLimiter, resetPassword);

// Social OAuth — rate-limited, no CAPTCHA (token verification acts as proof-of-humanity)
router.post('/google',   authLimiter, googleAuth);
router.post('/facebook', authLimiter, facebookAuth);

// ── Protected routes ───────────────────────────────────────────────────────

router.get('/me',              protect, getMe);
router.get('/profile',         protect, getMe);
router.put('/profile',         protect, updateMe);
router.put('/change-password', protect, updatePassword);

module.exports = router;
