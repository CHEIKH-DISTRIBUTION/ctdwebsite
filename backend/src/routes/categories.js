const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  getCategoryProducts
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/', getCategories);
router.get('/:idOrSlug', getCategory);
router.get('/:id/products', getCategoryProducts);

// Routes protégées (Admin seulement)
router.use(protect, authorize('admin'));

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.put('/:id/status', toggleCategoryStatus);
router.delete('/:id', deleteCategory);

module.exports = router;