// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Test de connexion à la base de données
const pool = require('./config/database');

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import des routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');  // Ajout de cette ligne

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);  // Ajout de cette ligne

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend fonctionne correctement!',
    timestamp: new Date().toISOString()
  });
});

// Route pour tester la base de données
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

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📱 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/api/db-test`);
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

// Affichage des routes (optionnel - pour le développement)
const listEndpoints = require('express-list-endpoints');
console.log("📍 Liste des routes :");
console.table(listEndpoints(app));

module.exports = app;