const mongoose = require('mongoose');

// 📍 Adresse
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  region: String,
  postalCode: String,
  country: {
    type: String,
    default: 'Sénégal'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  instructions: String
}, { _id: false });

// 📞 Contact
const contactInfoSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  alternativePhone: String,
  email: String
}, { _id: false });

// ⭐ Notation
const ratingSchema = new mongoose.Schema({
  delivery: { type: Number, min: 1, max: 5 },
  overall: { type: Number, min: 1, max: 5 },
  comment: String,
  ratedAt: Date
}, { _id: false });

module.exports = {
  addressSchema,
  contactInfoSchema,
  ratingSchema
};
