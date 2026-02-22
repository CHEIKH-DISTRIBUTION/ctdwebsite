const Pack = require('../models/Pack');
const Product = require('../models/Product');

// @desc    Créer un pack prédéfini par l'admin
// @route   POST /api/packs
// @access  Private/Admin
exports.createPack = async (req, res) => {
  try {
    const { name, description, items, discount, category, isFeatured } = req.body;

    // Validation des produits
    const packItems = [];
    let originalPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produit ${item.product} non trouvé`
        });
      }

      packItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtTimeOfAddition: product.price,
        name: product.name
      });

      originalPrice += product.price * item.quantity;
    }

    const price = discount
      ? originalPrice * (1 - discount / 100)
      : originalPrice;

    const pack = await Pack.create({
      name,
      description,
      items: packItems,
      originalPrice,
      price,
      discount,
      category:   category   ?? 'composite',
      isFeatured: isFeatured ?? false,
      createdBy: req.user.id
    });
    
    // Mettre à jour les produits avec la référence du pack
    await Product.updateMany(
      { _id: { $in: packItems.map(i => i.product) } },
      { $addToSet: { includedInPacks: pack._id } }
    );
    
    res.status(201).json({
      success: true,
      data: pack
    });
    
  } catch (error) {
    console.error('Erreur création pack:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Créer un pack personnalisé par le client
// @route   POST /api/packs/custom
// @access  Private
exports.createCustomPack = async (req, res) => {
  try {
    const { items, name } = req.body;
    
    // Validation et calcul
    const packItems = [];
    let total = 0;
    
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.product,
        isActive: true,
        stock: { $gte: item.quantity }
      });
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Produit ${item.product} indisponible`
        });
      }
      
      packItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtTimeOfAddition: product.price,
        name: product.name
      });
      
      total += product.price * item.quantity;
    }
    
    const pack = await Pack.create({
      name: name || `Pack personnalisé ${req.user.name}`,
      items: packItems,
      originalPrice: total,
      price: total,
      isCustom: true,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: pack
    });
    
  } catch (error) {
    console.error('Erreur création pack personnalisé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir un pack par ID
// @route   GET /api/packs/:id
// @access  Public
exports.getPack = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id)
      .populate('items.product', 'name price images');

    if (!pack || !pack.isActive) {
      return res.status(404).json({ success: false, message: 'Pack non trouvé' });
    }

    res.status(200).json({ success: true, data: pack });
  } catch (error) {
    console.error('Erreur récupération pack:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Obtenir tous les packs admin (incluant inactifs)
// @route   GET /api/packs/admin/all
// @access  Private/Admin
exports.getAllPacksAdmin = async (req, res) => {
  try {
    const packs = await Pack.find({ isCustom: false })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: packs.length, data: packs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un pack
// @route   PUT /api/packs/:id
// @access  Private/Admin
exports.updatePack = async (req, res) => {
  try {
    const { name, description, items, discount, category, isFeatured, isActive } = req.body;
    const pack = await Pack.findById(req.params.id);
    if (!pack) return res.status(404).json({ success: false, message: 'Pack non trouvé' });

    if (items !== undefined) {
      const packItems = [];
      let originalPrice = 0;
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) return res.status(404).json({ success: false, message: `Produit ${item.product} non trouvé` });
        packItems.push({ product: product._id, quantity: item.quantity, priceAtTimeOfAddition: product.price, name: product.name });
        originalPrice += product.price * item.quantity;
      }
      pack.items = packItems;
      pack.originalPrice = originalPrice;
      const effectiveDiscount = discount !== undefined ? discount : (pack.discount ?? 0);
      pack.price = effectiveDiscount > 0 ? originalPrice * (1 - effectiveDiscount / 100) : originalPrice;
    }

    if (name !== undefined) pack.name = name;
    if (description !== undefined) pack.description = description;
    if (discount !== undefined) {
      pack.discount = discount;
      if (items === undefined) pack.price = discount > 0 ? pack.originalPrice * (1 - discount / 100) : pack.originalPrice;
    }
    if (category  !== undefined) pack.category  = category;
    if (isFeatured !== undefined) pack.isFeatured = isFeatured;
    if (isActive   !== undefined) pack.isActive   = isActive;

    await pack.save();
    await pack.populate('items.product', 'name price images');
    res.json({ success: true, data: pack });
  } catch (error) {
    console.error('Erreur mise à jour pack:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un pack
// @route   DELETE /api/packs/:id
// @access  Private/Admin
exports.deletePack = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id);
    if (!pack) return res.status(404).json({ success: false, message: 'Pack non trouvé' });
    await pack.deleteOne();
    res.json({ success: true, message: 'Pack supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Obtenir tous les packs
// @route   GET /api/packs
// @access  Public
exports.getPacks = async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    
    const packs = await Pack.find(filter)
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: packs.length,
      data: packs
    });
    
  } catch (error) {
    console.error('Erreur récupération packs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};