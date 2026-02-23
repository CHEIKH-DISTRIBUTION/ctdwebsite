'use strict';

const User = require('../models/User');

// @desc  Get current user's favorites (populated products)
// @route GET /api/favorites
// @access Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'favorites',
      'name price images stock isFeatured rating category brand sku'
    );

    res.json({
      success: true,
      data: { favorites: user.favorites ?? [] },
    });
  } catch (err) {
    console.error('getFavorites error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc  Toggle a product in favorites (add if absent, remove if present)
// @route POST /api/favorites/:productId
// @access Private
exports.toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    const alreadyFav = user.favorites.some((id) => id.toString() === productId);

    if (alreadyFav) {
      user.favorites.pull(productId);
    } else {
      user.favorites.addToSet(productId);
    }

    await user.save();

    res.json({
      success: true,
      data: {
        isFavorite:  !alreadyFav,
        favoriteIds: user.favorites.map((id) => id.toString()),
      },
    });
  } catch (err) {
    console.error('toggleFavorite error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
