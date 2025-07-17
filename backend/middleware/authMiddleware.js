// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔍 authMiddleware - Starting authentication check...');
    
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    console.log('📋 Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header found');
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    // Extraire le token
    const token = authHeader.substring(7); // Enlever "Bearer "
    console.log('🎫 Token extracted:', token.substring(0, 50) + '...');

    // Vérifier que JWT_SECRET est défini
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Configuration du serveur manquante'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token decoded successfully:', decoded);

    // CORRECTION 1: Utiliser la bonne table "Utilisateur" au lieu de "users"
    // CORRECTION 2: Utiliser les bons noms de colonnes
    const userQuery = 'SELECT id_u as id, nom, prenom, email, role FROM Utilisateur WHERE id_u = $1';
    const result = await pool.query(userQuery, [decoded.userId]);

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = result.rows[0];
    console.log('👤 User found:', user);

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.userId = user.id;

    console.log('✅ Authentication successful');
    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    
    // Gestion spécifique des erreurs JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};

module.exports = authMiddleware;