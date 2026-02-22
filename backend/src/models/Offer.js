const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, 'Le titre est requis'],
      trim:     true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    description: {
      type:      String,
      trim:      true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    /** URL d'une image de bannière (optionnel). */
    image: {
      type: String,
      trim: true,
    },
    /** Texte libre décrivant la remise : "25%", "-500 FCFA", "2+1 gratuit"… */
    discount: {
      type:     String,
      required: [true, 'La remise est requise'],
      trim:     true,
      maxlength: 50,
    },
    validUntil: {
      type:     Date,
      required: [true, 'La date de fin est requise'],
    },
    category: {
      type: String,
      trim: true,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
  },
  { timestamps: true }
);

OfferSchema.index({ isActive: 1, validUntil: -1 });

module.exports = mongoose.model('Offer', OfferSchema);
