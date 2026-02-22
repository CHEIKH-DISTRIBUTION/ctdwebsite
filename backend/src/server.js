const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const rateLimit      = require('express-rate-limit');
const mongoSanitize  = require('express-mongo-sanitize');
const hpp            = require('hpp');
const path           = require('path');
require('dotenv').config();

// Importer la configuration de la base de données
const connectDB = require('./config/db');

// Importer les routes (v1 — legacy controllers)
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const userRoutes    = require('./routes/users');
const statsRoutes   = require('./routes/stats');
const paymentRoutes = require('./routes/payments');
const packRoutes    = require('./routes/packs');
const offerRoutes   = require('./routes/offers');

// Importer les routes (v2 — DDD architecture)
const ordersV2Routes = require('./interfaces/http/routes/orders');

// Connecter à la base de données
connectDB();

const app = express();

// ── Security middleware stack ──────────────────────────────────────────────
app.use(helmet());

// CORS — credentials mode required for httpOnly refresh-token cookie
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// NoSQL injection prevention — Express 5 compat: req.query is a read-only getter
// so we sanitize only req.body using the sanitize() helper directly.
app.use((req, _res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  next();
});

// HTTP Parameter Pollution prevention
app.use(hpp());

// Global rate-limit: 100 req / IP / 15 min (auth routes apply their own tighter limits)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Trop de requêtes, veuillez réessayer dans quelques minutes.' },
});

app.use('/api/', globalLimiter);

// Middleware pour parser le JSON.
// The `verify` callback stores the raw buffer on req.rawBody so webhook
// handlers can verify HMAC-SHA256 signatures before trusting the payload.
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    if (req.path.startsWith('/api/payments/webhook')) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API v1 (legacy)
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/stats',    statsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/packs',    packRoutes);
app.use('/api/offers',   offerRoutes);

// Routes API v2 (DDD architecture)
app.use('/api/v2/orders', ordersV2Routes);

// Route de test
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Cheikh Distribution fonctionne correctement',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware de gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Démarrer le serveur (skipped during tests — Supertest creates its own server)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 API disponible sur: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);

    if (process.env.NODE_ENV === 'development') {
      console.log('\n📋 Routes disponibles:');
      console.log('   POST /api/auth/register - Inscription');
      console.log('   POST /api/auth/login - Connexion');
      console.log('   GET  /api/auth/me - Profil utilisateur');
      console.log('   GET  /api/users - Liste des utilisateurs (Admin)');
      console.log('   PUT  /api/users/:id/activate - Activer un utilisateur (Admin)');
      console.log('   GET  /api/products - Liste des produits');
      console.log('   POST /api/orders - Créer une commande');
      console.log('   GET  /api/stats/dashboard - Statistiques (Admin)');
    }
  });
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err, promise) => {
  console.log('Erreur non gérée:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('Exception non capturée:', err.message);
  process.exit(1);
});

module.exports = app;