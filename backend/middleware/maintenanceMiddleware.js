// backend/middleware/maintenanceMiddleware.js
const pool = require('../config/database');

const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Vérifier si le mode maintenance est activé
    const result = await pool.query(`
      SELECT valeur FROM parametres_systeme 
      WHERE cle = 'maintenance_mode'
    `);
    
    // Si le mode maintenance n'est pas configuré, continuer normalement
    if (result.rows.length === 0) {
      return next();
    }
    
    const maintenanceMode = result.rows[0].valeur === 'true';
    
    // Si le mode maintenance est désactivé, continuer normalement
    if (!maintenanceMode) {
      return next();
    }
    
    // Vérifier si l'utilisateur est un administrateur
    const user = req.user;
    if (user && user.role === 'admin') {
      return next();
    }
    
    // Si l'utilisateur n'est pas admin et le mode maintenance est activé
    return res.status(503).json({
      success: false,
      message: 'Site en maintenance. Veuillez réessayer plus tard.',
      maintenanceMode: true
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification du mode maintenance:', error);
    // En cas d'erreur, laisser passer pour éviter de bloquer le site
    return next();
  }
};

module.exports = checkMaintenanceMode;