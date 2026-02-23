const mongoose = require('mongoose');
const { addressSchema, contactInfoSchema, ratingSchema } = require('./schemas/commonSchemas');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  pack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  name: String, // Nom du produit ou pack au moment de la commande
  total: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wave', 'orange_money', 'cash', 'bank_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    paymentReference: String
  },
  deliveryAddress: addressSchema,
  contactInfo: contactInfoSchema,
  deliveryDate: {
    requested: Date,
    estimated: Date,
    actual: Date
  },
  deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: {
    customer: String,
    admin: String,
    delivery: String
  },
  tracking: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  rating: ratingSchema,
}, {
  timestamps: true
});

// Les indexes et le pre-save restent identiques
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
// orderNumber a déjà unique:true → index créé automatiquement, pas besoin de schema.index()

// In Mongoose 8+, pre('save') runs AFTER built-in validation.
// orderNumber is required, so we must generate it in pre('validate')
// so it is present when Mongoose checks required fields.
orderSchema.pre('validate', async function (next) {
  if (!this.orderNumber) {
    const now = this.createdAt || new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    this.orderNumber = `CD${year}${month}${day}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);