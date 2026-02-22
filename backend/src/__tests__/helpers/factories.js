'use strict';

/**
 * Test data factories.
 *
 * All factories insert documents directly into the in-memory DB
 * and return the Mongoose document (or plain object) so tests can
 * reference IDs without repeating setup boilerplate.
 */
const jwt  = require('jsonwebtoken');
const User    = require('../../models/User');
const Product = require('../../models/Product');

// ── Counters ──────────────────────────────────────────────────────────────────
let _userSeq    = 0;
let _productSeq = 0;

// ── Users ─────────────────────────────────────────────────────────────────────

/**
 * Create a customer user.
 * @param {object} [overrides]
 * @returns {Promise<import('mongoose').Document>}
 */
async function makeUser(overrides = {}) {
  const n = ++_userSeq;
  return User.create({
    name:     `Test User ${n}`,
    email:    `user${n}-${Date.now()}@test.sn`,
    password: 'password123',
    phone:    `77${String(n).padStart(7, '0')}`,
    role:     'customer',
    ...overrides,
  });
}

/**
 * Create an admin user.
 * @param {object} [overrides]
 */
async function makeAdmin(overrides = {}) {
  return makeUser({ role: 'admin', ...overrides });
}

/**
 * Sign a JWT for the given user document (or user id string).
 * @param {import('mongoose').Document|string} user
 * @returns {string}
 */
function makeToken(user) {
  const id = typeof user === 'string' ? user : user._id.toString();
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// ── Products ──────────────────────────────────────────────────────────────────

/**
 * Create a product.  `createdBy` must be a valid User ObjectId.
 * @param {import('mongoose').Types.ObjectId|string} createdBy
 * @param {object} [overrides]
 * @returns {Promise<import('mongoose').Document>}
 */
async function makeProduct(createdBy, overrides = {}) {
  const n = ++_productSeq;
  return Product.create({
    name:        `Produit Test ${n}`,
    description: `Description du produit test numéro ${n}`,
    price:       1000,
    category:    'Alimentaire',
    stock:       100,
    sku:         `SKU-TEST-${n}-${Date.now()}`,
    createdBy,
    ...overrides,
  });
}

// ── Reusable order payloads ───────────────────────────────────────────────────

const DELIVERY_ADDRESS = {
  street:  '123 Rue Blaise Diagne',
  city:    'Dakar',
  region:  'Dakar',
  country: 'Sénégal',
};

const CONTACT_INFO = {
  name:  'Test User',
  phone: '771234567',
  email: 'test@test.sn',
};

module.exports = {
  makeUser,
  makeAdmin,
  makeToken,
  makeProduct,
  DELIVERY_ADDRESS,
  CONTACT_INFO,
};
