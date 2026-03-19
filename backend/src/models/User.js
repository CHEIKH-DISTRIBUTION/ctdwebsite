const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez entrer un email valide'
    ]
  },
  password: {
    type: String,
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false
  },
  phone: {
    type: String,
    default: '',
    validate: {
      validator: function (v) {
        if (!v) return true; // allow empty for social-auth users
        return /^(\+221|221)?[0-9]{9}$/.test(v);
      },
      message: 'Veuillez entrer un numéro de téléphone sénégalais valide',
    },
  },
  googleId:   { type: String, default: null, index: true, sparse: true },
  facebookId: { type: String, default: null, index: true, sparse: true },
  address: {
    street: String,
    city: String,
    region: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Sénégal'
    }
  },
  addresses: [{
    label:      { type: String, default: 'Domicile' }, // "Domicile", "Bureau", etc.
    street:     String,
    city:       String,
    region:     String,
    postalCode: String,
    country:    { type: String, default: 'Sénégal' },
    isDefault:  { type: Boolean, default: false },
  }],
  role: {
    type: String,
    enum: ['customer', 'admin', 'delivery'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: true
    }
  },

  // Delivery person rating (computed from order ratings)
  deliveryRating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },

  // Favorites — array of product references
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // Password reset (hashed token stored in DB; plain token sent by email)
  resetPasswordToken:  { type: String, select: false },
  resetPasswordExpire: { type: Date,   select: false }
}, {
  timestamps: true
});


// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
