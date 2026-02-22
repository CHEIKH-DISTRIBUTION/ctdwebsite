const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
  updateUserRole
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes protégées et réservées aux admins
router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.put('/:id/deactivate', deactivateUser);
router.put('/:id/activate', activateUser);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;