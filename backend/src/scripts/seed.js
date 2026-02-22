const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/db');
const seedData = require('../utils/seedData');

const runSeed = async () => {
    try {
        // Connecter à la base de données
        await connectDB();

        // Exécuter le seeding
        await seedData();

        console.log('✅ Seeding terminé avec succès');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
        process.exit(1);
    }
};

runSeed();