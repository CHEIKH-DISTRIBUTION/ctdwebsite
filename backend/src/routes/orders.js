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
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

const router = express.Router();

// Routes client
router.post('/', protect, validateOrder, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/rate', protect, rateOrder);

// Routes admin/livreur
router.put('/:id/status',           protect, authorize('admin', 'delivery'), updateOrderStatus);
router.get('/delivery',             protect, authorize('admin', 'delivery'), getDeliveryOrders);
router.put('/:id/confirm-payment',  protect, authorize('admin'),             confirmPayment);
router.put('/:id/assign-delivery',  protect, authorize('admin'),             assignDelivery);
router.get('/admin/all',            protect, authorize('admin'),             getAllOrders);

module.exports = router;