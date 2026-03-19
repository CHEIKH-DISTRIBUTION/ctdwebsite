const express = require('express');
const {
  validateCoupon,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Customer route — validate a coupon code
router.post('/validate', protect, validateCoupon);

// Admin routes — CRUD
router.use(protect, authorize('admin'));
router.post('/', createCoupon);
router.get('/', getCoupons);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
