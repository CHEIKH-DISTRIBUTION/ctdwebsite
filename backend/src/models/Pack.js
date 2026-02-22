const mongoose = require('mongoose');

const PackItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtTimeOfAddition: {
    type: Number,
    required: true
  },
  name: String // Sauvegarde du nom au moment de l'ajout
});

const PackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du pack est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  items: [PackItemSchema],
  originalPrice: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    enum: ['alimentaire', 'hygiene', 'composite'],
    default: 'composite'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    url: String,
    alt: String
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calcul du prix avant sauvegarde
PackSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    if (this.items && this.items.length > 0) {
      this.originalPrice = this.items.reduce(
        (total, item) => total + (item.priceAtTimeOfAddition * item.quantity), 0
      );
      
      if (!this.price) {
        this.price = this.discount 
          ? this.originalPrice * (1 - this.discount / 100)
          : this.originalPrice;
      }
    }
  }
  next();
});

module.exports = mongoose.model('Pack', PackSchema);