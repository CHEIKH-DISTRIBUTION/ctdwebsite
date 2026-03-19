const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },

    // 'percentage' → e.g. 10 = 10% off   |  'fixed' → e.g. 5000 = 5 000 FCFA off
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },

    // Optional cap for percentage discounts (e.g. max 20 000 FCFA off)
    maxDiscount: { type: Number, default: null },

    // Minimum order subtotal to qualify
    minOrderAmount: { type: Number, default: 0 },

    // Validity window
    startDate: { type: Date, default: Date.now },
    endDate:   { type: Date, required: true },

    // Usage limits
    maxUses:      { type: Number, default: null }, // null = unlimited
    usedCount:    { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 1 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for fast lookup by code
couponSchema.index({ code: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
