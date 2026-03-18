'use strict';

/**
 * One-shot script: reset admin password.
 *
 * Usage:
 *   node src/scripts/reset-admin-password.js <new-password>
 *
 * Example:
 *   node src/scripts/reset-admin-password.js MonSuperMotDePasse2024
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const EMAIL = 'admin@cheikhdistribution.sn';

async function main() {
  const newPassword = process.argv[2];
  if (!newPassword || newPassword.length < 8) {
    console.error('Usage: node src/scripts/reset-admin-password.js <mot-de-passe-8-chars-min>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: EMAIL });
  if (!user) {
    console.error(`Utilisateur ${EMAIL} introuvable.`);
    process.exit(1);
  }

  user.password = newPassword; // pre('save') hash automatiquement
  await user.save();

  console.log(`Mot de passe de ${EMAIL} réinitialisé avec succès.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
