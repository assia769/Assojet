// backend/routes/api.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route de test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Route protégée de test
router.get('/protected-test', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route is working!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;