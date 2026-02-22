const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Routes publiques
router.get('/', getProducts);
router.get('/:id', getProduct);

// Routes protégées
router.post('/:id/reviews', protect, addReview);

// Routes admin
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadProductImages,
  handleUploadError,
  validateProduct,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadProductImages,
  handleUploadError,
  updateProduct
);

router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;