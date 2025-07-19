
// // backend/server.js

// // Ajoutez ceci tout en haut de server.js

// const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');
// const authMiddleware = require('./middleware/authMiddleware');
// const fs = require('fs');
// const path = require('path');

// console.log('🔍 Current directory:', process.cwd());
// console.log('🔍 __dirname:', __dirname);
// console.log('🔍 .env file exists:', fs.existsSync('.env'));
// console.log('🔍 .env file path:', path.resolve('.env'));

// // Essayez de lire le fichier .env manuellement pour vérifier
// try {
//   const envContent = fs.readFileSync('.env', 'utf8');
//   console.log('🔍 .env content preview (first 100 chars):', JSON.stringify(envContent.substring(0, 100)));
//   console.log('🔍 .env file size:', envContent.length, 'bytes');
// } catch (error) {
//   console.error('❌ Cannot read .env file:', error.message);
// }

// // Chargement de dotenv avec configuration explicite
// const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '.env') });
// console.log('🔍 dotenv result:', dotenvResult);
// console.log('🔍 JWT_SECRET after dotenv:', process.env.JWT_SECRET ? 'LOADED ✅' : 'NOT LOADED ❌');
// console.log('🔍 All env vars loaded:', Object.keys(process.env).filter(key => key.startsWith('JWT')));

// // Vérification que JWT_SECRET est défini
// if (!process.env.JWT_SECRET) {
//   console.error('❌ JWT_SECRET is not defined!');
//   console.error('💡 Available environment variables starting with J:', 
//     Object.keys(process.env).filter(key => key.startsWith('J')));
//   process.exit(1);
// }

// const express = require('express');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Test de connexion à la base de données
// const pool = require('./config/database');

// // Middleware CORS
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Middleware pour parser JSON
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Middleware pour servir les fichiers statiques
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Import des routes
// const authRoutes = require('./routes/auth');
// const adminRoutes = require('./routes/admin');

// // Utilisation des routes
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);


// // Appliquer le middleware maintenance pour toutes les autres routes
// app.use(maintenanceMiddleware);

// // Puis vos autres routes(j'ai pas les encore entamer c'est pour cela que j'ai commenté)
// // app.use('/api/users', userRoutes);
// // app.use('/api/patients', patientRoutes);
// // Route de test
// app.get('/api/test', (req, res) => {
//   res.json({ 
//     success: true, 
//     message: 'Backend fonctionne correctement!',
//     timestamp: new Date().toISOString(),
//     jwtConfigured: !!process.env.JWT_SECRET
//   });
// });

// // Route pour tester la base de données
// app.get('/api/db-test', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT NOW()');
//     res.json({
//       success: true,
//       message: 'Base de données connectée',
//       time: result.rows[0].now
//     });
//   } catch (error) {
//     console.error('Erreur de test DB:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur de connexion à la base de données',
//       error: error.message
//     });
//   }
// });

// // Route de test pour JWT
// app.get('/api/jwt-test', (req, res) => {
//   res.json({
//     success: true,
//     message: 'JWT is configured',
//     jwtSecretExists: !!process.env.JWT_SECRET,
//     jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
//   });
// });

// // Middleware de gestion des erreurs
// app.use((err, req, res, next) => {
//   console.error('Erreur serveur:', err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Erreur interne du serveur',
//     error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
//   });
// });

// // Gestion des routes non trouvées
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route non trouvée'
//   });
// });

// // Démarrage du serveur
// app.listen(PORT, () => {
//   console.log(`🚀 Serveur démarré sur le port ${PORT}`);
//   console.log(`🌐 URL: http://localhost:${PORT}`);
//   console.log(`📱 Test API: http://localhost:${PORT}/api/test`);
//   console.log(`🗄️  Test DB: http://localhost:${PORT}/api/db-test`);
//   console.log(`🔑 Test JWT: http://localhost:${PORT}/api/jwt-test`);
  
//   // Vérification finale
//   console.log('\n=== CONFIGURATION FINALE ===');
//   console.log(`✅ JWT_SECRET: ${process.env.JWT_SECRET ? 'CONFIGURÉ' : 'NON CONFIGURÉ'}`);
//   console.log(`✅ PORT: ${PORT}`);
//   console.log(`✅ DB_HOST: ${process.env.DB_HOST}`);
//   console.log('===============================\n');
// });

// // Gestion des erreurs non capturées
// process.on('uncaughtException', (err) => {
//   console.error('Erreur non capturée:', err);
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Promesse rejetée non gérée:', reason);
//   process.exit(1);
// });

// // Affichage des routes (optionnel - pour le développement)
// try {
//   const listEndpoints = require('express-list-endpoints');
//   console.log("📍 Liste des routes :");
//   console.table(listEndpoints(app));
// } catch (error) {
//   console.log("📍 express-list-endpoints non installé (optionnel)");
// }

// module.exports = app;
// backend/server.js

const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

console.log('🔍 Current directory:', process.cwd());
console.log('🔍 __dirname:', __dirname);
console.log('🔍 .env file exists:', fs.existsSync('.env'));
console.log('🔍 .env file path:', path.resolve('.env'));

try {
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('🔍 .env content preview (first 100 chars):', JSON.stringify(envContent.substring(0, 100)));
  console.log('🔍 .env file size:', envContent.length, 'bytes');
} catch (error) {
  console.error('❌ Cannot read .env file:', error.message);
}

const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('🔍 dotenv result:', dotenvResult);
console.log('🔍 JWT_SECRET after dotenv:', process.env.JWT_SECRET ? 'LOADED ✅' : 'NOT LOADED ❌');
console.log('🔍 All env vars loaded:', Object.keys(process.env).filter(key => key.startsWith('JWT')));

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined!');
  console.error('💡 Available environment variables starting with J:', 
    Object.keys(process.env).filter(key => key.startsWith('J')));
  process.exit(1);
}

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const pool = require('./config/database');

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Exclude specific routes from maintenance
app.use('/api/auth', authRoutes);
app.use('/api/admin/settings', adminRoutes);

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

// app.use('/api/users', userRoutes);
// app.use('/api/patients', patientRoutes);

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

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

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
});

process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
  process.exit(1);
});

try {
  const listEndpoints = require('express-list-endpoints');
  console.log("📍 Liste des routes :");
  console.table(listEndpoints(app));
} catch (error) {
  console.log("📍 express-list-endpoints non installé (optionnel)");
}

module.exports = app;
