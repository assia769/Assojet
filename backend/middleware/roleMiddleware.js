// middleware/roleMiddleware.js
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    console.log('🔍 roleMiddleware - Checking user role...');
    console.log('👤 User from token:', req.user);
    console.log('🎭 Required roles:', allowedRoles);
    console.log('🎯 User role:', req.user?.role);
    
    try {
      // Vérifier si l'utilisateur existe (normalement déjà vérifié par authMiddleware)
      if (!req.user) {
        console.log('❌ No user found in request');
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      // Vérifier si l'utilisateur a un rôle
      if (!req.user.role) {
        console.log('❌ No role found for user');
        return res.status(403).json({
          success: false,
          message: 'Rôle utilisateur non défini'
        });
      }

      // Vérifier si le rôle de l'utilisateur est dans les rôles autorisés
      if (!allowedRoles.includes(req.user.role)) {
        console.log('❌ User role not authorized');
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Rôle insuffisant'
        });
      }

      console.log('✅ Role check passed');
      next();
    } catch (error) {
      console.error('❌ Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de vérification des rôles'
      });
    }
  };
};

module.exports = roleMiddleware;