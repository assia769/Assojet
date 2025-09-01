// backend/server.js
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
  
  // En production, on essaie de continuer avec une valeur par défaut (pour le debug)
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Running in production without JWT_SECRET - this will cause authentication issues');
    // Ne pas quitter en production pour permettre le debug
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

// Middlewares globaux
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000','/^https:\/\/.*\.netlify\.app$/'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'] // Ajoutez cette ligne

}));

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

// Routes qui ne sont PAS soumises à la maintenance
app.use('/api/auth', authRoutes);
app.use('/api/admin/settings', adminRoutes);

// Middleware de maintenance pour les autres routes
app.use((req, res, next) => {
  const excludedPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/admin/settings'
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
    jwtConfigured: !!process.env.JWT_SECRET
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
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📱 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/api/db-test`);
  console.log(`🔑 Test JWT: http://localhost:${PORT}/api/jwt-test`);

  console.log('\n=== CONFIGURATION FINALE ===');
  console.log(`✅ JWT_SECRET: ${process.env.JWT_SECRET ? 'CONFIGURÉ' : 'NON CONFIGURÉ'}`);
  console.log(`✅ PORT: ${PORT}`);
  console.log(`✅ DB_HOST: ${process.env.DB_HOST}`);
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