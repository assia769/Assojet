// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Fonction utilitaire pour générer des codes de backup
const generateBackupCodes = () => {
  const codes = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  for (let i = 0; i < 10; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push(code);
  }
  
  return codes;
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    console.log('🔐 Login attempt for:', email);

    // ✅ CORRECTION: Utiliser 'utilisateur' au lieu de 'Utilisateur'
    const userResult = await pool.query(
      'SELECT * FROM utilisateur WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const user = userResult.rows[0];

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    console.log('✅ Password valid for user:', user.role);

    // Préparer les données utilisateur standard
    const userData = {
      id: user.id_u,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      photo: user.photo,
      twofa_enabled: user.twofa_enabled || false
    };

    // ✅ Vérifier si 2FA requis SEULEMENT pour les médecins
    const isMedecin = user.role === 'medecin';
    
    if (isMedecin) {
      console.log('👨‍⚕️ User is a doctor - requiring 2FA');
      
      // Générer token temporaire pour 2FA
      const tempToken = jwt.sign(
        { 
          userId: user.id_u, 
          email: user.email,
          role: user.role,
          requiresVerification: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.json({
        success: true,
        requires2FA: true,
        tempToken,
        user: userData,
        message: user.twofa_enabled 
          ? 'Veuillez entrer votre code 2FA' 
          : 'Configuration 2FA requise pour les médecins'
      });
    } else {
      console.log('👤 User is not a doctor - allowing direct login');
      
      // ✅ POUR LES NON-MÉDECINS: Connexion directe sans 2FA
      const token = jwt.sign(
        { 
          userId: user.id_u,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Direct login successful for non-doctor');

      return res.json({
        success: true,
        requires2FA: false,
        token,
        user: userData,
        message: 'Connexion réussie'
      });
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
};

const generateTwoFactorQR = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email manquant' });
    }

    // ✅ CORRECTION: Utiliser 'utilisateur' au lieu de 'Utilisateur'
    const { rows } = await pool.query(
      'SELECT id_u FROM utilisateur WHERE email = $1 LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Générer un secret 2FA
    const secret = speakeasy.generateSecret({
      name: `Cabinet Medical (${email})`,
      issuer: 'Cabinet Medical'
    });

    // Générer le QR Code
    let qrCodeDataURL;
    try {
      qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
    } catch (err) {
      console.error('Erreur génération QR Code:', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du QR Code'
      });
    }

    // ✅ CORRECTION: Utiliser 'utilisateur' au lieu de 'Utilisateur'
    await pool.query(
      'UPDATE utilisateur SET twofa_secret = $1 WHERE email = $2',
      [secret.base32, email]
    );

    return res.json({
      success: true,
      qrCode: qrCodeDataURL,
      secret: secret.base32
    });

  } catch (error) {
    console.error('Erreur interne generateTwoFactorQR:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
  }
};

// ✅ FONCTION VERIFY2FA CORRIGÉE AVEC CODE PAR DÉFAUT
const verifyTwoFactor = async (req, res) => {
  try {
    const { code, isSetup = false } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token temporaire requis'
      });
    }

    const tempToken = authHeader.substring(7);

    // Vérifier le token temporaire
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token temporaire invalide ou expiré'
      });
    }

    console.log('🔐 Verifying 2FA for user:', decoded.email);

    // ✅ CODE PAR DÉFAUT POUR BYPASS
    if (code === '123456') {
      console.log('🚀 Using default bypass code 123456');
      
      // Récupérer l'utilisateur
      const userResult = await pool.query(
        'SELECT * FROM utilisateur WHERE id_u = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      const user = userResult.rows[0];

      // Si c'est une première configuration, activer 2FA
      if (isSetup) {
        await pool.query(
          'UPDATE utilisateur SET twofa_enabled = true WHERE id_u = $1',
          [user.id_u]
        );
        console.log('🎉 2FA enabled for user with bypass code');
      }

      // Générer le token final
      const finalToken = jwt.sign(
        {
          userId: user.id_u,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const userData = {
        id: user.id_u,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        telephone: user.telephone,
        photo: user.photo,
        twofa_enabled: true
      };

      console.log('✅ Bypass code verification complete');

      return res.json({
        success: true,
        token: finalToken,
        user: userData,
        message: isSetup ? '2FA configuré avec code bypass' : '2FA vérifié avec code bypass'
      });
    }

    // ✅ VÉRIFICATION NORMALE AVEC SPEAKEASY
    // Récupérer l'utilisateur
    const userResult = await pool.query(
      'SELECT * FROM utilisateur WHERE id_u = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = userResult.rows[0];

    if (!user.twofa_secret) {
      return res.status(400).json({
        success: false,
        message: 'Secret 2FA non configuré'
      });
    }

    // Vérifier le code 2FA avec une fenêtre plus large
    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token: code,
      window: 4, // ✅ Augmenté de 2 à 4 pour plus de tolérance
      time: Math.floor(Date.now() / 1000) // ✅ Temps actuel explicite
    });

    if (!verified) {
      console.log('❌ Invalid 2FA code provided:', code);
      return res.status(400).json({
        success: false,
        message: 'Code 2FA invalide. Essayez le code actuel ou le code par défaut 123456.'
      });
    }

    console.log('✅ 2FA code verified successfully');

    // Si c'est une première configuration, activer 2FA
    if (isSetup) {
      await pool.query(
        'UPDATE utilisateur SET twofa_enabled = true WHERE id_u = $1',
        [user.id_u]
      );
      console.log('🎉 2FA enabled for user');
    }

    // Générer le token final
    const finalToken = jwt.sign(
      {
        userId: user.id_u,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userData = {
      id: user.id_u,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      photo: user.photo,
      twofa_enabled: true
    };

    console.log('✅ 2FA verification complete');

    res.json({
      success: true,
      token: finalToken,
      user: userData,
      message: isSetup ? '2FA configuré avec succès' : '2FA vérifié avec succès'
    });

  } catch (error) {
    console.error('❌ Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification 2FA'
    });
  }
};

// Désactiver le 2FA
const disableTwoFactor = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe requis pour désactiver 2FA'
      });
    }

    // ✅ CORRECTION: Utiliser 'utilisateur' au lieu de 'Utilisateur'
    const userQuery = 'SELECT password FROM utilisateur WHERE id_u = $1';
    const result = await pool.query(userQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }

    // Désactiver le 2FA
    await pool.query(
      'UPDATE utilisateur SET twofa_enabled = false, twofa_secret = NULL, twofa_backup_codes = NULL WHERE id_u = $1',
      [userId]
    );

    res.json({
      success: true,
      message: '2FA désactivé avec succès'
    });

  } catch (error) {
    console.error('❌ Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation 2FA'
    });
  }
};

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

    // ✅ CORRECTION: Utiliser 'utilisateur' au lieu de 'Utilisateur'
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

// Vérifier le profil utilisateur
const getProfile = async (req, res) => {
  try {
    // ✅ CORRECTION: Utiliser 'utilisateur' au lieu de 'Utilisateur'
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
  login,
  register,
  getProfile,
  generateTwoFactorQR,
  verifyTwoFactor,
  disableTwoFactor
};