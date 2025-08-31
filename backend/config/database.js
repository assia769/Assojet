// // backend/config/database.js
// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME || 'medical',
//   user: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || 'assia2004',
//    // Paramètres du pool pour éviter les timeouts
//   max: 20, // Maximum de connexions dans le pool
//   min: 2,  // Minimum de connexions maintenues
//   idleTimeoutMillis: 30000, // Ferme les connexions inactives après 30s
//   connectionTimeoutMillis: 10000, // Timeout pour établir une connexion (10s)
//   acquireTimeoutMillis: 10000, // Timeout pour acquérir une connexion du pool
  
//   // Paramètres de keep-alive pour éviter les déconnexions
//   keepAlive: true,
//   keepAliveInitialDelayMillis: 10000,
  
//   // Gestion des erreurs de connexion
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
// });

// // Gestionnaire d'erreurs global pour le pool
// pool.on('error', (err, client) => {
//   console.error('❌ Unexpected error on idle client:', err);
// });

// // Test de connexion
// pool.connect((err, client, release) => {
//   if (err) {
//     return console.error('Error acquiring client', err.stack);
//   }
//   console.log('Connected to PostgreSQL database');
//   release();
// });

// module.exports = pool;
const { Pool } = require('pg');

// Utilisez DATABASE_URL directement depuis les variables d'environnement
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // Configuration optimisée pour Neon DB
  max: 3,
  min: 0,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 30000,
  acquireTimeoutMillis: 30000,
  
  // SSL obligatoire pour Neon
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Gestionnaire d'erreurs
pool.on('error', (err, client) => {
  if (err.message.includes('Connection terminated')) {
    console.log('⚠️ Connexion fermée par Neon (normal)');
  } else {
    console.error('❌ Database error:', err.message);
  }
});

// Test de connexion
pool.connect()
  .then(client => {
    console.log('✅ Connected to Neon PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    console.error('💡 DATABASE_URL:', process.env.DATABASE_URL ? 'Exists' : 'Missing');
  });

module.exports = pool;