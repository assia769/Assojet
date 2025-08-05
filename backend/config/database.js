// backend/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'medical',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'assia2004',
   // Paramètres du pool pour éviter les timeouts
  max: 20, // Maximum de connexions dans le pool
  min: 2,  // Minimum de connexions maintenues
  idleTimeoutMillis: 30000, // Ferme les connexions inactives après 30s
  connectionTimeoutMillis: 10000, // Timeout pour établir une connexion (10s)
  acquireTimeoutMillis: 10000, // Timeout pour acquérir une connexion du pool
  
  // Paramètres de keep-alive pour éviter les déconnexions
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  
  // Gestion des erreurs de connexion
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Gestionnaire d'erreurs global pour le pool
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err);
});

// Test de connexion
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

module.exports = pool;