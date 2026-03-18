'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const admins = await User.find({ role: 'admin' }).select('name email phone isActive');
  if (!admins.length) {
    console.log('Aucun admin trouvé.');
  } else {
    admins.forEach((a) => console.log(`${a.email} | ${a.name} | active: ${a.isActive}`));
  }
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
