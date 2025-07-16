
// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Génération du token JWT
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    
  );
};

// Inscription
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { nom, prenom, email, password, role = 'patient', telephone, adresse } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await pool.query(
      'SELECT id_u FROM utilisateur WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO utilisateur (nom, prenom, email, password, role, telephone, adresse, photo, date_derniere_connexion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING id_u, nom, prenom, email, role`,
      [nom, prenom, email, hashedPassword, role, telephone, adresse, 'default.jpg']
    );

    const newUser = result.rows[0];

    // Générer le token
    const token = generateToken(newUser.id_u, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: newUser.id_u,
          nom: newUser.nom,
          prenom: newUser.prenom,
          email: newUser.email,
          role: newUser.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur lors de l\'inscription'
    });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { email, password, twoFactorCode } = req.body;

    // Vérifier si l'utilisateur existe
    const userResult = await pool.query(
      'SELECT id_u, nom, prenom, email, password, role, deuxfa_code FROM utilisateur WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = userResult.rows[0];

    // Vérifier le mot de passe
    let isPasswordValid = false;
    
    // Vérifier si le mot de passe est hashé
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Pour les anciens mots de passe non hashés (temporaire)
      isPasswordValid = password === user.password;
      
      // Optionnel: hasher le mot de passe pour la prochaine fois
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await pool.query(
          'UPDATE utilisateur SET password = $1 WHERE id_u = $2',
          [hashedPassword, user.id_u]
        );
      }
    }

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le 2FA pour les médecins
    if (user.role === 'medecin' && user.deuxfa_code) {
      if (!twoFactorCode) {
        return res.status(400).json({
          success: false,
          message: 'Code d\'authentification à deux facteurs requis',
          requiresTwoFactor: true
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.deuxfa_code,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Code d\'authentification à deux facteurs invalide'
        });
      }
    }

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE utilisateur SET date_derniere_connexion = NOW() WHERE id_u = $1',
      [user.id_u]
    );

    // Générer le token
    const token = generateToken(user.id_u, user.email, user.role);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id_u,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur lors de la connexion'
    });
  }
};

// Générer le QR code pour 2FA
const generateTwoFactorQR = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const secret = speakeasy.generateSecret({
      name: `Cabinet Medical (${email})`,
      issuer: 'Cabinet Medical'
    });

    // Sauvegarder le secret
    await pool.query(
      'UPDATE utilisateur SET deuxfa_code = $1 WHERE email = $2',
      [secret.base32, email]
    );

    // Générer le QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: 'QR code généré avec succès',
      data: {
        qrCode: qrCodeUrl,
        secret: secret.base32
      }
    });

  } catch (error) {
    console.error('Erreur génération QR 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du QR code 2FA'
    });
  }
};

// Vérifier le profil utilisateur
const getProfile = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id_u, nom, prenom, email, role, telephone, adresse, photo FROM utilisateur WHERE id_u = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id_u,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          telephone: user.telephone,
          adresse: user.adresse,
          photo: user.photo
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

module.exports = {
  register,
  login,
  generateTwoFactorQR,
  getProfile
};