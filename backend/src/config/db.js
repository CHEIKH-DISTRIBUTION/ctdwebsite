const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            console.log(' Connexion à MongoDB en cours…');
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log(' Connexion à MongoDB réussie');

        mongoose.connection.on('connected', () => {
            console.log(' Mongoose connecté');
        });

        mongoose.connection.on('error', (err) => {
            console.error(' Mongoose erreur de connexion :', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn(' Mongoose déconnecté');
        });

    } catch (error) {
        console.error(' Échec de la connexion à MongoDB', error);
        process.exit(1);
    }
};

module.exports = connectDB;
