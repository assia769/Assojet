// backend/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('prenom').notEmpty().withMessage('Le prénom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('role').isIn(['admin', 'medecin', 'secretaire', 'patient']).withMessage('Rôle invalide'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

const twoFactorValidation = [
  body('tempToken').notEmpty().withMessage('Token temporaire requis'),
  body('code').isLength({ min: 6, max: 8 }).withMessage('Code invalide'),
];

// Routes publiques
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Routes pour 2FA
router.post('/generate-2fa', 
  body('email').isEmail().withMessage('Email invalide'),
  authController.generateTwoFactorQR
);

router.post('/verify-2fa', twoFactorValidation, authController.verifyTwoFactor);

// Routes protégées
router.get('/profile', protect, authController.getProfile);
router.post('/disable-2fa', 
  protect, 
  body('password').notEmpty().withMessage('Mot de passe requis'),
  authController.disableTwoFactor
);

module.exports = router;