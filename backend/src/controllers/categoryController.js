const Category = require('../models/Category');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Récupérer toutes les catégories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  // Filtrage avancé
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Category.find(JSON.parse(queryStr)).populate('parentCategory subcategories');

  // Sélection des champs
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Tri
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('sortOrder');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Category.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Exécution de la requête
  const categories = await query;

  // Résultat de la pagination
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: categories.length,
    pagination,
    data: categories
  });
});

// @desc    Récupérer une catégorie par slug ou ID
// @route   GET /api/categories/:idOrSlug
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({
    $or: [
      { _id: req.params.idOrSlug },
      { slug: req.params.idOrSlug }
    ]
  }).populate('parentCategory subcategories');

  if (!category) {
    return next(new ErrorResponse('Catégorie non trouvée', 404));
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Créer une catégorie
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  // Ajouter l'utilisateur connecté comme créateur
  req.body.createdBy = req.user.id;

  const category = await Category.create(req.body);

  // Mettre à jour la catégorie parente si nécessaire
  if (req.body.parentCategory) {
    await Category.findByIdAndUpdate(
      req.body.parentCategory,
      { $addToSet: { subcategories: category._id } }
    );
  }

  res.status(201).json({
    success: true,
    message: 'Catégorie créée avec succès',
    data: category
  });
});

// @desc    Mettre à jour une catégorie
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Catégorie non trouvée', 404));
  }

  // Gestion de la catégorie parente
  if (req.body.parentCategory && req.body.parentCategory !== category.parentCategory.toString()) {
    // Retirer de l'ancienne catégorie parente
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(
        category.parentCategory,
        { $pull: { subcategories: category._id } }
      );
    }

    // Ajouter à la nouvelle catégorie parente
    await Category.findByIdAndUpdate(
      req.body.parentCategory,
      { $addToSet: { subcategories: category._id } }
    );
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Catégorie mise à jour',
    data: category
  });
});

// @desc    Activer/Désactiver une catégorie
// @route   PUT /api/categories/:id/status
// @access  Private/Admin
exports.toggleCategoryStatus = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Catégorie non trouvée', 404));
  }

  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json({
    success: true,
    message: `Catégorie ${category.isActive ? 'activée' : 'désactivée'}`,
    data: category
  });
});

// @desc    Supprimer une catégorie
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Catégorie non trouvée', 404));
  }

  // Retirer de la catégorie parente
  if (category.parentCategory) {
    await Category.findByIdAndUpdate(
      category.parentCategory,
      { $pull: { subcategories: category._id } }
    );
  }

  // Transférer les sous-catégories au parent ou à null
  if (category.subcategories.length > 0) {
    await Category.updateMany(
      { _id: { $in: category.subcategories } },
      { parentCategory: category.parentCategory || null }
    );
  }

  await category.remove();

  res.status(200).json({
    success: true,
    message: 'Catégorie supprimée',
    data: {}
  });
});

// @desc    Récupérer les produits d'une catégorie
// @route   GET /api/categories/:id/products
// @access  Public
exports.getCategoryProducts = asyncHandler(async (req, res, next) => {
  // Implémentation dépendante de votre modèle Product
  // Exemple basique :
  const products = await Product.find({ 
    category: req.params.id,
    isActive: true 
  });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});