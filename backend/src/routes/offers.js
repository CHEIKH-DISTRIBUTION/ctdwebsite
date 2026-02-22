const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');

const router = express.Router();

router.route('/')
  .get(getOffers)
  .post(protect, authorize('admin'), createOffer);

router.route('/:id')
  .get(getOffer)
  .put(protect,    authorize('admin'), updateOffer)
  .delete(protect, authorize('admin'), deleteOffer);

module.exports = router;
