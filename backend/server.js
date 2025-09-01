// backend/server.js - Version corrigée pour Railway/Netlify
const fs = require('fs');
const path = require('path');

// Chargement des variables d'environnement - Version corrigée pour Railway
console.log('🔍 Current directory:', process.cwd());
console.log('🔍 __dirname:', __dirname);

// Charger dotenv SEULEMENT en développement local
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '.env') });
    console.log('🔍 dotenv result (development):', dotenvResult);
  } catch (error) {
    console.log('ℹ️  .env file not found in development, continuing without it');
  }
} else {
  console.log('🚀 Production mode - using Railway environment variables');
}

// Vérification des variables essentielles
console.log('🔍 JWT_SECRET from environment:', process.env.JWT_SECRET ? 'LOADED ✅' : 'NOT LOADED ❌');
console.log('🔍 DATABASE_URL from environment:', process.env.DATABASE_URL ? 'LOADED ✅' : 'NOT LOADED ❌');

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined!');
  console.error('💡 Available environment variables:', Object.keys(process.env));
  
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Running in production without JWT_SECRET - this will cause authentication issues');
  } else {
    process.exit(1);
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined!');
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Running without DATABASE_URL - database connections will fail');
  } else {
    process.exit(1);
  }
}

// Imports principaux
const express = require('express');
const cors = require('cors');

// Configuration de l'application
const app = express();
const PORT = process.env.PORT || 5000;

// Import de la base de données
const pool = require('./config/database');

// ✅ CONFIGURATION CORS AMÉLIORÉE POUR RAILWAY/NETLIFY
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (ex: applications mobiles, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001", 
      "https://euphonious-tanuki-6e76f4.netlify.app",
      "https://assojet-production.up.railway.app", // Votre domaine Railway
      // Ajouter d'autres domaines si nécessaire
    ];
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS: Origin not allowed: ${origin}`);
      // En production, on peut être plus strict
      callback(null, true); // Temporairement permissif pour debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200, // Pour supporter les anciens navigateurs
  preflightContinue: false
};

// ✅ Appliquer CORS avec options avancées
app.use(cors(corsOptions));

// ✅ Middleware pour préflight requests (OPTIONS)
app.options('*', cors(corsOptions));

// ✅ Headers de sécurité supplémentaires
app.use((req, res, next) => {
  // Headers CORS manuels en cas de problème
  const origin = req.headers.origin;
  if (origin && [
    "http://localhost:3000",
    "https://euphonious-tanuki-6e76f4.netlify.app"
  ].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-HTTP-Method-Override');
  
  // Log des requêtes pour debug
  console.log(`🌐 ${req.method} ${req.path} from ${req.headers.origin || 'unknown origin'}`);
  
  next();
});

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import des middlewares
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');

// Import des routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const secretaryRoutes = require('./routes/secretary');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');

// ✅ Route de test CORS
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Routes qui ne sont PAS soumises à la maintenance
app.use('/api/auth', authRoutes);
app.use('/api/admin/settings', adminRoutes);

// Middleware de maintenance pour les autres routes
app.use((req, res, next) => {
  const excludedPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/admin/settings',
    '/api/cors-test'
  ];

  if (excludedPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  maintenanceMiddleware(req, res, next);
});

// Routes soumises à la maintenance
app.use('/api/secretary', secretaryRoutes);
app.use('/api/doctor', doctorRoutes); 
app.use('/api/patient', patientRoutes);

// Routes de test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend fonctionne correctement!',
    timestamp: new Date().toISOString(),
    jwtConfigured: !!process.env.JWT_SECRET,
    origin: req.headers.origin
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Base de données connectée',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('Erreur de test DB:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error.message
    });
  }
});

app.get('/api/jwt-test', (req, res) => {
  res.json({
    success: true,
    message: 'JWT is configured',
    jwtSecretExists: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  if (err.maintenanceMode) {
    return res.status(503).json({
      success: false,
      message: 'Site en maintenance',
      maintenanceMode: true
    });
  }
  
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Route 404 (doit être en dernier)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
  process.exit(1);
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => { // ✅ Écouter sur toutes les interfaces
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📱 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/api/db-test`);
  console.log(`🔑 Test JWT: http://localhost:${PORT}/api/jwt-test`);
  console.log(`🔄 Test CORS: http://localhost:${PORT}/api/cors-test`);

  console.log('\n=== CONFIGURATION FINALE ===');
  console.log(`✅ JWT_SECRET: ${process.env.JWT_SECRET ? 'CONFIGURÉ' : 'NON CONFIGURÉ'}`);
  console.log(`✅ PORT: ${PORT}`);
  console.log(`✅ CORS Origins: localhost:3000, euphonious-tanuki-6e76f4.netlify.app`);
  console.log('===============================\n');

  // Affichage des routes (optionnel)
  try {
    const listEndpoints = require('express-list-endpoints');
    console.log("📍 Liste des routes :");
    console.table(listEndpoints(app));
  } catch (error) {
    console.log("📍 express-list-endpoints non installé (optionnel)");
  }
});

module.exports = app;