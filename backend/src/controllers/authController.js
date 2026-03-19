'use strict';

const crypto        = require('crypto');
const axios         = require('axios');
const jwt           = require('jsonwebtoken');
const User          = require('../models/User');
const RefreshToken  = require('../models/RefreshToken');
const audit         = require('../infrastructure/logger/auditLogger');

// ── Token helpers ──────────────────────────────────────────────────────────

/** Access token — lifetime controlled by JWT_EXPIRE env variable (default 30d). */
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

/** 48-byte random refresh token. Returns both the plain value and its SHA-256 hash. */
const generateRefreshToken = () => {
  const plain = crypto.randomBytes(48).toString('hex');
  const hash  = crypto.createHash('sha256').update(plain).digest('hex');
  return { plain, hash };
};

/** Read the refresh-token value from the Cookie header (without cookie-parser). */
const getRefreshCookie = (req) => {
  const header = req.headers.cookie || '';
  const match  = header.split(';').find((c) => c.trim().startsWith('refreshToken='));
  if (!match) return null;
  return match.split('=').slice(1).join('=').trim() || null;
};

/** Set the refresh token as an httpOnly, Secure, SameSite cookie scoped to /api/auth/refresh.
 *  SameSite=None in production because frontend (Vercel) and backend (Railway) are cross-origin.
 *  SameSite=None requires Secure, which is already set in production.
 */
const setRefreshCookie = (res, plainToken) => {
  const isProd  = process.env.NODE_ENV === 'production';
  const maxAge  = 7 * 24 * 60 * 60; // 7 days in seconds
  const parts   = [
    `refreshToken=${plainToken}`,
    'HttpOnly',
    `Max-Age=${maxAge}`,
    'Path=/api/auth/refresh',
    `SameSite=${isProd ? 'None' : 'Lax'}`,
    ...(isProd ? ['Secure'] : []),
  ];
  res.setHeader('Set-Cookie', parts.join('; '));
};

/** Clear the refresh-token cookie. */
const clearRefreshCookie = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `refreshToken=; HttpOnly; Max-Age=0; Path=/api/auth/refresh; SameSite=${isProd ? 'None' : 'Lax'}${isProd ? '; Secure' : ''}`
  );
};

/** Persist a new refresh token document and set the cookie. */
const issueRefreshToken = async (res, req, userId) => {
  const { plain, hash } = generateRefreshToken();
  await RefreshToken.create({
    userId,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.headers['user-agent'] || '',
    ip:        req.ip || '',
  });
  setRefreshCookie(res, plain);
};

/** Shape of the user object returned in responses — never includes password/tokens. */
const publicUser = (u) => ({
  id:              u._id,
  name:            u.name,
  email:           u.email,
  phone:           u.phone,
  role:            u.role,
  isEmailVerified: u.isEmailVerified ?? false,
});

// ── register ───────────────────────────────────────────────────────────────
// Public registration ALWAYS creates role = customer — no exceptions.
// Sends a verification email; user can log in but cannot order until verified.
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const { sendEmailVerification } = require('../infrastructure/email/emailService');

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Veuillez fournir tous les champs requis' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Un compte avec cet email existe déjà' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // role is always 'customer' — any submitted role field is ignored
    const user = await User.create({
      name, email, password, phone, address,
      role: 'customer',
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    sendEmailVerification(email, verificationToken);

    const accessToken = generateAccessToken(user._id);
    await issueRefreshToken(res, req, user._id);

    await audit.log({ action: 'register', userId: user._id, email, req, success: true });

    return res.status(201).json({
      success: true,
      message: 'Inscription réussie. Un email de vérification a été envoyé.',
      data:    { token: accessToken, user: publicUser(user) },
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'inscription' });
  }
};

// ── login ──────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email }).select('+password');

    // Generic message — prevents user enumeration
    if (!user || !(await user.matchPassword(password))) {
      await audit.log({ action: 'login_failed', email, req, success: false });
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Compte désactivé. Contactez le support' });
    }

    const accessToken = generateAccessToken(user._id);
    await issueRefreshToken(res, req, user._id);

    await audit.log({ action: 'login', userId: user._id, email, req, success: true });

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data:    { token: accessToken, user: publicUser(user) },
    });
  } catch (err) {
    console.error('Erreur connexion:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── refreshToken ───────────────────────────────────────────────────────────
// Rotates the refresh token: old one is revoked, new one is issued.
exports.refreshToken = async (req, res) => {
  try {
    const rawToken = getRefreshCookie(req);
    if (!rawToken) {
      return res.status(401).json({ success: false, message: 'Session expirée' });
    }

    const hash   = crypto.createHash('sha256').update(rawToken).digest('hex');
    const stored = await RefreshToken.findOne({
      tokenHash: hash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!stored) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Session invalide ou expirée' });
    }

    const user = await User.findById(stored.userId);
    if (!user || !user.isActive) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable ou désactivé' });
    }

    // Token rotation
    stored.isRevoked = true;
    await stored.save();

    const newAccessToken = generateAccessToken(user._id);
    await issueRefreshToken(res, req, user._id);

    await audit.log({ action: 'token_refresh', userId: user._id, req, success: true });

    return res.status(200).json({
      success: true,
      data:    { token: newAccessToken },
    });
  } catch (err) {
    console.error('Erreur refresh token:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── logout ─────────────────────────────────────────────────────────────────
// Public endpoint — reads the refresh-token cookie and revokes it.
// No access token required (allows logout even with an expired access token).
exports.logout = async (req, res) => {
  try {
    const rawToken = getRefreshCookie(req);
    if (rawToken) {
      const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await RefreshToken.findOneAndUpdate({ tokenHash: hash }, { isRevoked: true });
    }
    clearRefreshCookie(res);

    if (req.user) {
      await audit.log({ action: 'logout', userId: req.user._id, req, success: true });
    }

    return res.status(200).json({ success: true, message: 'Déconnexion réussie' });
  } catch (err) {
    console.error('Erreur déconnexion:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── getMe ──────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json({ success: true, data: user });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── updateMe ───────────────────────────────────────────────────────────────
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({ success: true, message: 'Profil mis à jour', data: updated });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── updatePassword ─────────────────────────────────────────────────────────
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Mot de passe mis à jour' });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── forgotPassword ─────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { sendPasswordResetEmail } = require('../infrastructure/email/emailService');

    if (!email) {
      return res.status(400).json({ success: false, message: 'Veuillez fournir votre adresse email' });
    }

    await audit.log({ action: 'password_reset_request', email, req, success: true });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return 200 — never reveal whether the email exists (anti-enumeration)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.',
      });
    }

    const plainToken  = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, plainToken);
    } catch (emailErr) {
      console.error('Erreur envoi email réinitialisation:', emailErr);
      // Silent: still return 200 (anti-enumeration)
    }

    return res.status(200).json({
      success: true,
      message: 'Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.',
    });
  } catch (err) {
    console.error('Erreur forgot-password:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── resetPassword ──────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Le lien de réinitialisation est invalide ou a expiré.' });
    }

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await audit.log({ action: 'password_reset', userId: user._id, req, success: true });

    // Issue new tokens so the user is logged in immediately after reset
    const accessToken = generateAccessToken(user._id);
    await issueRefreshToken(res, req, user._id);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      data:    { token: accessToken },
    });
  } catch (err) {
    console.error('Erreur reset-password:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── googleAuth ─────────────────────────────────────────────────────────────
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Token Google manquant' });
    }

    const { data: payload } = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      return res.status(401).json({ success: false, message: 'Token Google invalide' });
    }

    const { sub: googleId, email, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email non disponible depuis Google' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; }
      if (!user.isEmailVerified) { user.isEmailVerified = true; }
      if (user.isModified()) { await user.save({ validateBeforeSave: false }); }
      if (!user.isActive) return res.status(403).json({ success: false, message: 'Compte désactivé' });
    } else {
      user = await User.create({
        name:            name || email.split('@')[0],
        email,
        googleId,
        password:        crypto.randomBytes(32).toString('hex'),
        phone:           '',
        avatar:          picture || null,
        role:            'customer',
        isEmailVerified: true,
      });
    }

    const accessToken = generateAccessToken(user._id);
    await issueRefreshToken(res, req, user._id);

    await audit.log({ action: 'google_auth', userId: user._id, email, req, success: true });

    return res.status(200).json({
      success: true,
      message: 'Connexion Google réussie',
      data:    { token: accessToken, user: publicUser(user) },
    });
  } catch (err) {
    console.error('Erreur authentification Google:', err);
    return res.status(500).json({ success: false, message: "Erreur lors de l'authentification Google" });
  }
};

// ── facebookAuth ───────────────────────────────────────────────────────────
exports.facebookAuth = async (req, res) => {
  try {
    const { accessToken: fbToken } = req.body;
    if (!fbToken) {
      return res.status(400).json({ success: false, message: 'Token Facebook manquant' });
    }

    const { data: fbUser } = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fbToken}`
    );

    const { id: facebookId, email, name, picture } = fbUser;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email non disponible depuis Facebook. Veuillez accorder les permissions email.',
      });
    }

    let user = await User.findOne({ $or: [{ facebookId }, { email }] });
    if (user) {
      if (!user.facebookId) { user.facebookId = facebookId; }
      if (!user.isEmailVerified) { user.isEmailVerified = true; }
      if (user.isModified()) { await user.save({ validateBeforeSave: false }); }
      if (!user.isActive) return res.status(403).json({ success: false, message: 'Compte désactivé' });
    } else {
      user = await User.create({
        name:            name || email.split('@')[0],
        email,
        facebookId,
        password:        crypto.randomBytes(32).toString('hex'),
        phone:           '',
        avatar:          picture?.data?.url || null,
        role:            'customer',
        isEmailVerified: true,
      });
    }

    const accessToken = generateAccessToken(user._id);
    await issueRefreshToken(res, req, user._id);

    await audit.log({ action: 'facebook_auth', userId: user._id, email, req, success: true });

    return res.status(200).json({
      success: true,
      message: 'Connexion Facebook réussie',
      data:    { token: accessToken, user: publicUser(user) },
    });
  } catch (err) {
    console.error('Erreur authentification Facebook:', err);
    return res.status(500).json({ success: false, message: "Erreur lors de l'authentification Facebook" });
  }
};

// ── verifyEmail ─────────────────────────────────────────────────────────
// GET /api/auth/verify-email/:token — public, clicked from email link
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: hashedToken })
      .select('+emailVerificationToken');

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';

    if (!user) {
      return res.redirect(`${clientUrl}/verify-email?status=invalid`);
    }

    user.isEmailVerified        = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    await audit.log({ action: 'email_verified', userId: user._id, email: user.email, req, success: true });

    return res.redirect(`${clientUrl}/verify-email?status=success`);
  } catch (err) {
    console.error('Erreur vérification email:', err);
    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
    return res.redirect(`${clientUrl}/verify-email?status=error`);
  }
};

// ── resendVerification ──────────────────────────────────────────────────
// POST /api/auth/resend-verification — protected
exports.resendVerification = async (req, res) => {
  try {
    const { sendEmailVerification } = require('../infrastructure/email/emailService');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email déjà vérifié' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    user.emailVerificationToken = hashedToken;
    await user.save({ validateBeforeSave: false });

    await sendEmailVerification(user.email, verificationToken);

    return res.status(200).json({
      success: true,
      message: 'Un nouvel email de vérification a été envoyé.',
    });
  } catch (err) {
    console.error('Erreur renvoi vérification:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Addresses (multiple) ──────────────────────────────────────────────────

// @desc    Get user addresses
// @route   GET /api/auth/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
  const user = await User.findById(req.user.id).select('addresses address');
  // Merge legacy single address into the array for backward compat
  let addresses = user.addresses || [];
  if (addresses.length === 0 && user.address?.street) {
    addresses = [{ ...user.address.toObject(), label: 'Domicile', isDefault: true }];
  }
  res.status(200).json({ success: true, data: addresses });
};

// @desc    Add a new address
// @route   POST /api/auth/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const { label, street, city, region, postalCode, country, isDefault } = req.body;
    if (!street || !city) {
      return res.status(400).json({ success: false, message: 'Rue et ville requises' });
    }

    const user = await User.findById(req.user.id);

    // If this is the default, unset other defaults
    if (isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    user.addresses.push({
      label: label || 'Autre',
      street, city,
      region: region || '',
      postalCode: postalCode || '',
      country: country || 'Sénégal',
      isDefault: isDefault || user.addresses.length === 0,
    });

    // Also update the legacy `address` field with the default
    const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    if (def) {
      user.address = { street: def.street, city: def.city, region: def.region, postalCode: def.postalCode, country: def.country };
    }

    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (error) {
    console.error('Erreur ajout adresse:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Update an address
// @route   PUT /api/auth/addresses/:addressId
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) {
      return res.status(404).json({ success: false, message: 'Adresse non trouvée' });
    }

    const { label, street, city, region, postalCode, country, isDefault } = req.body;
    if (label) addr.label = label;
    if (street) addr.street = street;
    if (city) addr.city = city;
    if (region !== undefined) addr.region = region;
    if (postalCode !== undefined) addr.postalCode = postalCode;
    if (country) addr.country = country;

    if (isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
      addr.isDefault = true;
    }

    // Sync legacy address
    const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    if (def) {
      user.address = { street: def.street, city: def.city, region: def.region, postalCode: def.postalCode, country: def.country };
    }

    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    console.error('Erreur mise à jour adresse:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Delete an address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) {
      return res.status(404).json({ success: false, message: 'Adresse non trouvée' });
    }

    const wasDefault = addr.isDefault;
    addr.deleteOne();

    // If we deleted the default, promote the first remaining
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    // Sync legacy address
    const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    user.address = def
      ? { street: def.street, city: def.city, region: def.region, postalCode: def.postalCode, country: def.country }
      : {};

    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    console.error('Erreur suppression adresse:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
