
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

router.get('/settings', authMiddleware, isAdmin, adminController.getSystemSettings);
router.put('/settings', authMiddleware, isAdmin, adminController.updateSystemSettings);
router.post('/settings/init', authMiddleware, isAdmin, adminController.initializeSystemSettings); 


module.exports = router;