const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  rateOrder,
  getAllOrders,
  getDeliveryOrders,
  confirmPayment,
  assignDelivery,
  changePaymentMethod,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

const router = express.Router();

// ── Specific named routes first (must come before /:id) ──────────────────────
router.get('/my-orders',  protect,                              getMyOrders);
router.get('/delivery',   protect, authorize('admin', 'delivery'), getDeliveryOrders);
router.get('/admin/all',  protect, authorize('admin'),             getAllOrders);

// ── Generic /:id routes ───────────────────────────────────────────────────────
router.post('/',                    protect, validateOrder,                        createOrder);
router.get('/:id',                  protect,                                       getOrder);
router.put('/:id/cancel',           protect,                                       cancelOrder);
router.put('/:id/payment-method',   protect,                                       changePaymentMethod);
router.put('/:id/rate',             protect,                                       rateOrder);
router.put('/:id/status',           protect, authorize('admin', 'delivery'),       updateOrderStatus);
router.put('/:id/confirm-payment',  protect, authorize('admin'),                   confirmPayment);
router.put('/:id/assign-delivery',  protect, authorize('admin'),                   assignDelivery);

module.exports = router;
