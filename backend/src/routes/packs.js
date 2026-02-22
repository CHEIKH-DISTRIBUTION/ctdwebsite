const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createPack,
  createCustomPack,
  getPacks,
  getPack,
  getAllPacksAdmin,
  updatePack,
  deletePack,
} = require('../controllers/packController');

const router = express.Router();

// Admin-only: all packs (including inactive) — must be before /:id
router.route('/admin/all')
  .get(protect, authorize('admin'), getAllPacksAdmin);

// Public list + admin create
router.route('/')
  .get(getPacks)
  .post(protect, authorize('admin'), createPack);

// Customer custom pack
router.route('/custom')
  .post(protect, createCustomPack);

// Single pack: public read, admin update/delete
router.route('/:id')
  .get(getPack)
  .put(protect, authorize('admin'), updatePack)
  .delete(protect, authorize('admin'), deletePack);

module.exports = router;
