const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// @desc    Valider un code promo (public — utilisé au checkout)
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Code promo requis' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Code promo invalide' });
    }

    // Check date validity
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({ success: false, message: 'Ce code promo a expiré' });
    }

    // Check global usage limit
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'Ce code promo a atteint sa limite d\'utilisation' });
    }

    // Check per-user usage limit
    if (coupon.maxUsesPerUser) {
      const userUses = await Order.countDocuments({
        user: req.user.id,
        couponCode: coupon.code,
        status: { $nin: ['cancelled'] },
      });
      if (userUses >= coupon.maxUsesPerUser) {
        return res.status(400).json({ success: false, message: 'Vous avez déjà utilisé ce code promo' });
      }
    }

    // Check minimum order amount
    if (subtotal && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Montant minimum de commande : ${coupon.minOrderAmount.toLocaleString('fr-FR')} FCFA`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal || 0) * coupon.discountValue / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        discount, // calculated discount for the given subtotal
      },
    });
  } catch (error) {
    console.error('Erreur validation coupon:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Créer un code promo
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ce code promo existe déjà' });
    }
    console.error('Erreur création coupon:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Lister tous les codes promo
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    console.error('Erreur récupération coupons:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un code promo
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon non trouvé' });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.error('Erreur mise à jour coupon:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un code promo
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon non trouvé' });
    }
    res.status(200).json({ success: true, message: 'Coupon supprimé' });
  } catch (error) {
    console.error('Erreur suppression coupon:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
