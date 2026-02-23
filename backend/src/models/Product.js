const mongoose = require('mongoose');
const Review = require('./Review'); // nécessaire pour la méthode de calcul
const Pack = require('./Pack'); // nécessaire pour la méthode de calcul

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['Alimentaire', 'Hygiène', 'Électroménager', 'Vêtements']
  },
  images: [{
    url:      { type: String, required: true },
    publicId: { type: String },               // Cloudinary public_id (used for deletion)
    alt:      String,
    isPrimary: { type: Boolean, default: false },
  }],
  stock: {
    type: Number,
    required: [true, 'Le stock est requis'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  minStock: { type: Number, default: 5, min: 0 },
  sku: { type: String, unique: true, required: [true, 'Le SKU est requis'] },
  brand: { type: String, trim: true },
  weight: {
    value: Number,
    unit: { type: String, enum: ['kg', 'g', 'l', 'ml'], default: 'kg' }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, enum: ['cm', 'm'], default: 'cm' }
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  includedInPacks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack'
  }],
  seoTitle: String,
  seoDescription: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });

/**
 * Calcule la moyenne des avis à partir du modèle Review externe
 */
productSchema.methods.calculateAverageRating = async function () {
  const reviews = await Review.find({ product: this._id });

  if (reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating.average = Math.round((total / reviews.length) * 10) / 10;
    this.rating.count = reviews.length;
  }

  await this.save();
};

module.exports = mongoose.model('Product', productSchema);
