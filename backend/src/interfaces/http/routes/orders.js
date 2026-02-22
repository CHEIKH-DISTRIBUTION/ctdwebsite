'use strict';

const express = require('express');
const { protect, authorize } = require('../../../middleware/auth');
const { OrderController }    = require('../controllers/OrderController');

const router = express.Router();

// ── Customer routes ─────────────────────────────────────────────────────────

// POST   /api/v2/orders            → Create a new order
router.post('/', protect, OrderController.createOrder);

// GET    /api/v2/orders/my-orders  → List the authenticated user's orders
router.get('/my-orders', protect, OrderController.getMyOrders);

// GET    /api/v2/orders/:id        → Get one order (own orders for customers)
router.get('/:id', protect, OrderController.getOrder);

// ── Admin routes ─────────────────────────────────────────────────────────────

// GET    /api/v2/orders/admin/all  → List all orders with filters
router.get('/admin/all', protect, authorize('admin'), OrderController.getAllOrders);

module.exports = router;
