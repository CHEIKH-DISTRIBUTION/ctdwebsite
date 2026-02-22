const express = require('express');
const {
  initiatePayment,
  checkPaymentStatus,
  paymentWebhook,
  processRefund
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Webhook — public (signature HMAC-SHA256 is the auth mechanism here)
router.post('/webhook/:provider', paymentWebhook);

// Routes protégées
router.post('/',           protect, initiatePayment);
router.get('/:id/status',  protect, checkPaymentStatus);
router.post('/:id/refund', protect, authorize('admin'), processRefund);

module.exports = router;