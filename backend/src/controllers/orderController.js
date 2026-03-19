const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Pack = require('../models/Pack');
const User = require('../models/User');
const emailService = require('../infrastructure/email/emailService');
const smsService   = require('../infrastructure/sms/smsService');

// @desc    Créer une commande (produits et/ou packs)
// @route   POST /api/orders
// @access  Private
//
// Task 1: Stock reservation uses atomic findOneAndUpdate({ $gte }) to prevent
//         overselling even under concurrent load (no read-then-write race).
// Task 2: The entire operation (price fetch + stock decrement + order insert)
//         runs inside a MongoDB session/transaction so a mid-flight failure
//         cannot leave stock decremented without a matching order.
//         Requires MongoDB replica set (Atlas, or `rs.initiate()` locally).
exports.createOrder = async (req, res) => {
  // Block unverified users from ordering
  const currentUser = await User.findById(req.user.id).select('isEmailVerified');
  if (currentUser && !currentUser.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Veuillez vérifier votre adresse email avant de passer une commande.',
    });
  }

  const session = await mongoose.startSession();
  let createdOrder;
  let lowStockProducts;

  try {
    await session.withTransaction(async () => {
      const { products = [], packs = [], paymentMethod, deliveryAddress, contactInfo, notes, couponCode } = req.body;

      if (products.length === 0 && packs.length === 0) {
        const err = new Error('La commande doit contenir au moins un produit ou un pack');
        err.httpStatus = 400;
        throw err;
      }

      let subtotal = 0;
      const orderItems = [];
      const stockReservations = []; // { productId, quantity, name }

      // ── Phase 1: Fetch prices (read, no stock touch yet) ──────────────────
      for (const item of products) {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          const err = new Error(`Produit ${item.product} non trouvé`);
          err.httpStatus = 404;
          throw err;
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
          total: itemTotal
        });

        stockReservations.push({ productId: product._id, quantity: item.quantity, name: product.name });
      }

      for (const packItem of packs) {
        const pack = await Pack.findById(packItem.pack)
          .populate('items.product')
          .session(session);

        if (!pack) {
          const err = new Error(`Pack ${packItem.pack} non trouvé`);
          err.httpStatus = 404;
          throw err;
        }

        for (const item of pack.items) {
          if (!item.product) {
            const err = new Error(`Produit manquant dans le pack ${pack.name}`);
            err.httpStatus = 400;
            throw err;
          }
          stockReservations.push({
            productId: item.product._id,
            quantity: item.quantity * packItem.quantity,
            name: item.product.name
          });
        }

        const packTotal = pack.price * packItem.quantity;
        subtotal += packTotal;

        orderItems.push({
          pack: pack._id,
          quantity: packItem.quantity,
          price: pack.price,
          name: pack.name,
          total: packTotal
        });
      }

      // ── Phase 2: Atomic stock reservation (Task 1 fix) ───────────────────
      // findOneAndUpdate with $gte guard: if stock was taken by a concurrent
      // request between Phase 1 and now, the update matches nothing → 400.
      for (const { productId, quantity, name } of stockReservations) {
        const updated = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { session, new: true }
        );

        if (!updated) {
          const prod = await Product.findById(productId).session(session);
          const err = new Error(
            `Stock insuffisant pour ${prod?.name ?? name}. ` +
            `Stock disponible: ${prod?.stock ?? 0}`
          );
          err.httpStatus = 400;
          throw err;
        }

        // Track products that fell below their minStock threshold
        if (updated.stock <= updated.minStock) {
          if (!lowStockProducts) lowStockProducts = [];
          lowStockProducts.push({
            _id: updated._id,
            name: updated.name,
            stock: updated.stock,
            minStock: updated.minStock,
          });
        }
      }

      // ── Phase 3: Coupon validation (if provided) ──────────────────────────
      let discount = 0;
      let appliedCouponCode = null;

      if (couponCode) {
        const Coupon = require('../models/Coupon');
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

        if (coupon) {
          const now = new Date();
          const isValid =
            now >= coupon.startDate &&
            now <= coupon.endDate &&
            (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
            subtotal >= coupon.minOrderAmount;

          if (isValid) {
            // Check per-user limit
            const userUses = await Order.countDocuments({
              user: req.user.id,
              couponCode: coupon.code,
              status: { $nin: ['cancelled'] },
            }).session(session);

            if (!coupon.maxUsesPerUser || userUses < coupon.maxUsesPerUser) {
              if (coupon.discountType === 'percentage') {
                discount = Math.round(subtotal * coupon.discountValue / 100);
                if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                  discount = coupon.maxDiscount;
                }
              } else {
                discount = coupon.discountValue;
              }
              // Don't let discount exceed subtotal
              if (discount > subtotal) discount = subtotal;
              appliedCouponCode = coupon.code;

              // Increment usage counter
              await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } }, { session });
            }
          }
        }
        // If coupon is invalid, we silently ignore it (no error, just no discount)
      }

      // ── Phase 4: Persist order (inside same transaction) ─────────────────
      const deliveryFee = subtotal >= 50000 ? 0 : 2000;
      const total = subtotal - discount + deliveryFee;

      // Order.create() with a session requires the array-of-docs form.
      const [order] = await Order.create(
        [{
          user: req.user.id,
          items: orderItems,
          subtotal,
          deliveryFee,
          discount,
          couponCode: appliedCouponCode,
          total,
          paymentMethod,
          deliveryAddress,
          contactInfo,
          notes: notes || {},
          tracking: [{
            status: 'pending',
            message: 'Commande créée et en attente de confirmation',
            updatedBy: req.user.id
          }]
        }],
        { session }
      );

      createdOrder = order;
    });

    // Transaction committed — populate outside the session (read-only)
    await createdOrder.populate([
      { path: 'items.product', select: 'name price images' },
      { path: 'items.pack', select: 'name price' },
      { path: 'user', select: 'name email phone' }
    ]);

    // Fire-and-forget low-stock alert email
    if (lowStockProducts && lowStockProducts.length > 0) {
      emailService.sendLowStockAlert(lowStockProducts).catch(() => {});
    }

    // Send order confirmation SMS (fire-and-forget)
    const smsUser = await User.findById(req.user.id).select('phone preferences').lean();
    if (smsUser) {
      smsService.sendOrderConfirmationSMS(smsUser, createdOrder).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: { order: createdOrder }
    });
  } catch (error) {
    if (error.httpStatus) {
      return res.status(error.httpStatus).json({
        success: false,
        message: error.message
      });
    }
    console.error('Erreur création commande:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la commande'
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Annuler une commande
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('items.pack');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier les permissions
    if (order.user.toString() !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas annuler cette commande'
      });
    }

    // Vérifier que la commande peut être annulée
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette commande ne peut pas être annulée'
      });
    }

    // Remettre les produits en stock
    for (const item of order.items) {
      if (item.product) {
        // Produit individuel
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: item.quantity } }
        );
      } else if (item.pack) {
        // Pack - besoin de retrouver les produits du pack
        const pack = await Pack.findById(item.pack._id).populate('items.product');
        if (pack) {
          for (const packItem of pack.items) {
            await Product.findByIdAndUpdate(
              packItem.product._id,
              { $inc: { stock: packItem.quantity * item.quantity } }
            );
          }
        }
      }
    }

    // Mettre à jour le statut
    order.status = 'cancelled';
    order.tracking.push({
      status: 'cancelled',
      message: reason || 'Commande annulée par le client',
      updatedBy: req.user.id
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Commande annulée avec succès'
    });
  } catch (error) {
    console.error('Erreur annulation commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Les autres méthodes (getMyOrders, getOrder, etc.) peuvent rester inchangées
// car elles utilisent déjà populate et gèrent correctement les données

// @desc    Obtenir les commandes de l'utilisateur
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let filter = { user: req.user.id };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir une commande par ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images')
      .populate('user', 'name email phone')
      .populate('deliveryPerson', 'name phone')
      .populate('tracking.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier que l'utilisateur peut accéder à cette commande
    if (order.user._id.toString() !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette commande'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Mettre à jour le statut d'une commande
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Delivery)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Mettre à jour le statut
    order.status = status;
    
    // Ajouter l'entrée de tracking
    order.tracking.push({
      status,
      message: message || `Statut mis à jour: ${status}`,
      updatedBy: req.user.id
    });

    // Mettre à jour la date de livraison si nécessaire
    if (status === 'delivered') {
      order.deliveryDate.actual = new Date();
    }

    await order.save();

    // Send confirmation email (fire-and-forget)
    if (status === 'confirmed') {
      const userEmail = order.contactInfo?.email;
      if (userEmail) {
        emailService.sendOrderConfirmation(order, userEmail).catch(() => {});
      }
    }

    // Send SMS notification (fire-and-forget)
    const orderUser = await User.findById(order.user).select('phone preferences').lean();
    if (orderUser) {
      smsService.sendOrderStatusSMS(orderUser, order).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Statut de la commande mis à jour',
      data: { order }
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};


// @desc    Noter une commande
// @route   PUT /api/orders/:id/rate
// @access  Private
exports.rateOrder = async (req, res) => {
  try {
    const { delivery, overall, comment } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier que l'utilisateur peut noter cette commande
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas noter cette commande'
      });
    }

    // Vérifier que la commande est livrée
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez noter que les commandes livrées'
      });
    }

    // Vérifier que la commande n'a pas déjà été notée
    if (order.rating && order.rating.ratedAt) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà noté cette commande'
      });
    }

    // Ajouter la note sur la commande
    order.rating = {
      delivery,
      overall,
      comment,
      ratedAt: new Date()
    };

    await order.save();

    // Propager la note sur le profil du livreur (moyenne incrémentale)
    if (order.deliveryPerson && delivery) {
      const User = require('../models/User');
      const driver = await User.findById(order.deliveryPerson);
      if (driver) {
        const prev   = driver.deliveryRating || { average: 0, count: 0 };
        const count  = prev.count + 1;
        const avg    = ((prev.average * prev.count) + delivery) / count;
        driver.deliveryRating = { average: Math.round(avg * 10) / 10, count };
        await driver.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Note ajoutée avec succès'
    });
  } catch (error) {
    console.error('Erreur notation commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Confirmer la réception d'un virement bancaire (Admin)
// @route   PUT /api/orders/:id/confirm-payment
// @access  Private/Admin
exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    order.paymentStatus = 'completed';
    if (order.paymentDetails) {
      order.paymentDetails.paymentDate = new Date();
    } else {
      order.paymentDetails = { paymentDate: new Date() };
    }

    // Auto-confirm order if still pending
    if (order.status === 'pending') {
      order.status = 'confirmed';
      order.tracking.push({
        status: 'confirmed',
        message: 'Virement bancaire confirmé par l\'administration',
        updatedBy: req.user.id,
      });
    }

    await order.save();
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Affecter un livreur à une commande (Admin)
// @route   PUT /api/orders/:id/assign-delivery
// @access  Private/Admin
exports.assignDelivery = async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPerson: deliveryPersonId || null },
      { new: true }
    )
      .populate('user', 'name phone')
      .populate('deliveryPerson', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    console.error('Erreur affectation livreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Obtenir les commandes pour les livreurs (ready + delivering + delivered today)
// @route   GET /api/orders/delivery
// @access  Private (Admin/Delivery)
exports.getDeliveryOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['ready', 'delivering', 'delivered'] };
    }

    // For "delivered", only show the last 7 days to keep the list manageable
    if (status === 'delivered') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filter['deliveryDate.actual'] = { $gte: sevenDaysAgo };
    }

    const orders = await Order.find(filter)
      .populate('user', 'name phone')
      .populate('deliveryPerson', 'name phone')
      .sort({ updatedAt: -1 })
      .limit(100);

    // Quick counts (for the tab badges)
    const [readyCount, deliveringCount] = await Promise.all([
      Order.countDocuments({ status: 'ready' }),
      Order.countDocuments({ status: 'delivering' }),
    ]);

    res.status(200).json({
      success: true,
      data: { orders, counts: { ready: readyCount, delivering: deliveringCount } },
    });
  } catch (error) {
    console.error('Erreur récupération commandes livreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Obtenir toutes les commandes (Admin)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    let filter = {};
    
    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
      .populate('deliveryPerson', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    // Statistiques
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        stats: stats[0] || { totalRevenue: 0, averageOrderValue: 0, totalOrders: 0 }
      }
    });
  } catch (error) {
    console.error('Erreur récupération toutes commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
// @desc    Changer la méthode de paiement d'une commande (si paiement encore en attente)
// @route   PUT /api/orders/:id/payment-method
// @access  Private
exports.changePaymentMethod = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const allowed = ['wave', 'orange_money', 'cash', 'bank_transfer'];
    if (!allowed.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Méthode de paiement invalide' });
    }

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images')
      .populate('user', 'name email phone')
      .populate('deliveryPerson', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    if (!['pending', 'failed'].includes(order.paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Le paiement a déjà été traité' });
    }

    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'pending';
    await order.save();

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    console.error('Erreur changement méthode paiement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
