const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Chargement des variables d'env
dotenv.config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes (on ajoutera plus tard)
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
