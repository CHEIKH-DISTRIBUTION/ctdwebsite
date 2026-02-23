'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const { getFavorites, toggleFavorite } = require('../controllers/favoritesController');

const router = express.Router();

router.get('/',          protect, getFavorites);
router.post('/:productId', protect, toggleFavorite);

module.exports = router;
