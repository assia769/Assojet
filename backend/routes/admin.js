// // routes/admin.js
// const express = require('express');
// const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');
// const adminController = require('../controllers/adminController');

// const router = express.Router();

// // Debug middleware pour tracer les requêtes
// router.use((req, res, next) => {
//   console.log('🚀 Admin route accessed:', req.method, req.path);
//   console.log('📋 Headers:', req.headers);
//   next();
// });

// // Middleware pour vérifier que l'utilisateur est authentifié
// router.use(authMiddleware);

// // Debug après auth middleware
// router.use((req, res, next) => {
//   console.log('✅ After auth middleware, user:', req.user);
//   next();
// });

// // Middleware pour vérifier que l'utilisateur est admin
// router.use(roleMiddleware(['admin']));

// // Debug après role middleware
// router.use((req, res, next) => {
//   console.log('✅ After role middleware, proceeding to controller');
//   next();
// });

// // Routes du dashboard admin
// router.get('/dashboard/stats', (req, res, next) => {
//   console.log('🎯 Accessing dashboard stats controller');
//   adminController.getDashboardStats(req, res, next);
// });


// // Routes de gestion des utilisateurs
// router.get('/users', adminController.getUsers);
// router.post('/users', adminController.createUser);
// router.put('/users/:id', adminController.updateUser);
// router.delete('/users/:id', adminController.deleteUser);

// // Routes de génération de rapports
// router.get('/reports', adminController.generateReport);

// module.exports = router;
// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Middleware pour vérifier que l'utilisateur est admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Utilisateur non authentifié'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Droits administrateur requis.'
    });
  }
  
  next();
};

// Debug route access
router.use((req, res, next) => {
  console.log('🚀 Admin route accessed:', req.method, req.path);
  console.log('📋 Headers:', req.headers);
  next();
});

// Routes admin - TOUTES protégées par authMiddleware ET isAdmin
router.get('/dashboard/stats', authMiddleware, isAdmin, adminController.getDashboardStats);
router.get('/users', authMiddleware, isAdmin, adminController.getUsers);
router.post('/users', authMiddleware, isAdmin, adminController.createUser);
router.put('/users/:id', authMiddleware, isAdmin, adminController.updateUser);
router.delete('/users/:id', authMiddleware, isAdmin, adminController.deleteUser);
router.get('/reports', authMiddleware, isAdmin, adminController.generateReport);

module.exports = router;