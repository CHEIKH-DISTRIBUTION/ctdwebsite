const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    required: true,
    enum: ['wave', 'orange_money', 'cash', 'bank_transfer']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type:   String,
    unique: true,
    sparse: true, // autorise plusieurs documents sans transactionId (null)
  },
  paymentDetails: {
    // Champs communs
    phone: String, // Pour Wave/Orange Money
    email: String,
    
    // Pour cartes bancaires
    cardLast4: String,
    cardBrand: String,
    
    // Pour Wave
    wavePaymentToken: String,
    
    // Pour Orange Money
    orangeMoneyToken: String,
    
    // Autres métadonnées
    gatewayResponse: Object
  },
  processedAt: Date,
  refundedAt: Date,
  errorMessage: String
}, {
  timestamps: true
});

// Index pour améliorer les performances
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
// transactionId a déjà unique:true → index créé automatiquement, pas besoin de schema.index()

module.exports = mongoose.model('Payment', paymentSchema);