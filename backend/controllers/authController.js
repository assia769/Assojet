// // backend/controllers/authController.js
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const speakeasy = require('speakeasy');
// const QRCode = require('qrcode');
// const pool = require('../config/database');
// const { validationResult } = require('express-validator');

// // Fonction utilitaire pour générer des codes de backup
// const generateBackupCodes = () => {
//   const codes = [];
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
//   for (let i = 0; i < 10; i++) {
//     let code = '';
//     for (let j = 0; j < 8; j++) {
//       code += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     codes.push(code);
//   }
  
//   return codes;
// };

// // Login classique
// const login = async (req, res) => {
//   try {
//     console.log('🔐 Login attempt started');
    
//     // Validation des entrées
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('❌ Validation errors:', errors.array());
//       return res.status(400).json({
//         success: false,
//         message: 'Données invalides',
//         errors: errors.array()
//       });
//     }

//     const { email, password } = req.body;
//     console.log('📧 Login attempt for email:', email);

//     // Rechercher l'utilisateur
//     const userQuery = `
//       SELECT id_u, nom, prenom, email, password, role, twofa_enabled, twofa_secret
//       FROM Utilisateur 
//       WHERE email = $1
//     `;
    
//     const result = await pool.query(userQuery, [email]);

//     if (result.rows.length === 0) {
//       console.log('❌ User not found');
//       return res.status(401).json({
//         success: false,
//         message: 'Email ou mot de passe incorrect'
//       });
//     }

//     const user = result.rows[0];
//     console.log('👤 User found:', { id: user.id_u, email: user.email, role: user.role });

//     // Vérifier le mot de passe
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       console.log('❌ Invalid password');
//       return res.status(401).json({
//         success: false,
//         message: 'Email ou mot de passe incorrect'
//       });
//     }

//     console.log('✅ Password valid');

//     // Vérifier si l'utilisateur est médecin et si 2FA est activé
//     if (user.role === 'medecin' && user.twofa_enabled) {
//       console.log('🔐 2FA required for doctor');
      
//       // Générer un token temporaire pour la vérification 2FA
//       const tempToken = jwt.sign(
//         { 
//           userId: user.id_u, 
//           email: user.email,
//           role: user.role,
//           requires2FA: true
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: '10m' } // Token temporaire de 10 minutes
//       );

//       return res.json({
//         success: true,
//         requires2FA: true,
//         tempToken,
//         message: 'Veuillez entrer votre code 2FA'
//       });
//     }

//     // Si pas de 2FA requis ou pas médecin, connexion normale
//     const token = jwt.sign(
//       { 
//         userId: user.id_u,
//         email: user.email,
//         role: user.role
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
//     );

//     // Mettre à jour la dernière connexion
//     await pool.query(
//       'UPDATE Utilisateur SET date_derniere_connexion = NOW() WHERE id_u = $1',
//       [user.id_u]
//     );

//     console.log('✅ Login successful');

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user.id_u,
//         nom: user.nom,
//         prenom: user.prenom,
//         email: user.email,
//         role: user.role,
//         twofa_enabled: user.twofa_enabled
//       }
//     });

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur serveur lors de la connexion'
//     });
//   }
// };

// // Générer le QR Code pour 2FA
// const generateTwoFactorQR = async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email requis'
//       });
//     }

//     console.log('🔧 Generating 2FA QR Code for:', email);

//     // Vérifier que l'utilisateur existe et est médecin
//     const userQuery = `
//       SELECT id_u, nom, prenom, email, role, twofa_enabled 
//       FROM Utilisateur 
//       WHERE email = $1 AND role = 'medecin'
//     `;
    
//     const result = await pool.query(userQuery, [email]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Médecin non trouvé'
//       });
//     }

//     const user = result.rows[0];

//     // Générer un secret pour 2FA
//     const secret = speakeasy.generateSecret({
//       name: `Cabinet Médical - Dr. ${user.prenom} ${user.nom} (${user.email})`,
//       issuer: 'Cabinet Médical Premium',
//       length: 32
//     });

//     console.log('🔧 Generated 2FA secret:', {
//       base32: secret.base32,
//       length: secret.base32.length,
//       otpauth_url: secret.otpauth_url
//     });

//     // Générer des codes de backup
//     const backupCodes = generateBackupCodes();

//     // Sauvegarder le secret temporairement (sera confirmé lors de la vérification)
//     await pool.query(
//       'UPDATE Utilisateur SET twofa_secret = $1, twofa_backup_codes = $2 WHERE id_u = $3',
//       [secret.base32, backupCodes, user.id_u]
//     );

//     // Générer un token temporaire pour la configuration
//     const tempToken = jwt.sign(
//       { 
//         userId: user.id_u,
//         email: user.email,
//         role: user.role,
//         isSetup: true
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '30m' } // Token temporaire de 30 minutes pour la configuration
//     );

//     // Générer le QR Code
//     const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

//     console.log('✅ 2FA QR Code generated for user:', user.email);

//     res.json({
//       success: true,
//       qrCode: qrCodeUrl,
//       secret: secret.base32,
//       tempToken: tempToken, // Ajout du tempToken
//       backupCodes: backupCodes,
//       message: 'QR Code généré avec succès'
//     });

//   } catch (error) {
//     console.error('❌ Generate 2FA QR error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la génération du QR Code'
//     });
//   }
// };

// // Vérifier le code 2FA
// const verifyTwoFactor = async (req, res) => {
//   try {
//     const { tempToken, code, isSetup = false } = req.body;

//     console.log('🔐 2FA Verification attempt:', { 
//       hasToken: !!tempToken, 
//       code: code ? 'provided' : 'missing', 
//       isSetup 
//     });

//     if (!tempToken || !code) {
//       return res.status(400).json({
//         success: false,
//         message: 'Token temporaire et code requis'
//       });
//     }

//     // Vérifier le token temporaire
//     let decoded;
//     try {
//       decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
//       console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email, isSetup: decoded.isSetup });
//     } catch (error) {
//       console.log('❌ Token verification failed:', error.message);
//       return res.status(401).json({
//         success: false,
//         message: 'Token temporaire invalide ou expiré'
//       });
//     }

//     // Récupérer l'utilisateur
//     const userQuery = `
//       SELECT id_u, nom, prenom, email, role, twofa_secret, twofa_enabled, twofa_backup_codes
//       FROM Utilisateur 
//       WHERE id_u = $1
//     `;
    
//     const result = await pool.query(userQuery, [decoded.userId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Utilisateur non trouvé'
//       });
//     }

//     const user = result.rows[0];

//     if (!user.twofa_secret) {
//       console.log('❌ No 2FA secret found for user');
//       return res.status(400).json({
//         success: false,
//         message: '2FA non configuré'
//       });
//     }

//     // Nettoyer et valider le secret
//     const cleanSecret = user.twofa_secret.replace(/\s/g, '').toUpperCase();
//     console.log('🔍 Secret validation:');
//     console.log('- Original secret:', user.twofa_secret);
//     console.log('- Cleaned secret:', cleanSecret);
//     console.log('- Secret valid format:', /^[A-Z2-7]+=*$/.test(cleanSecret));

//     console.log('🔍 Verifying code for user:', user.email);

//     // Vérifier le code 2FA avec différentes approches
//     let verified = false;
    
//     // Debug: Afficher les informations de temps et codes
//     const currentTime = Math.floor(Date.now() / 1000);
//     console.log('🕐 Time debug:');
//     console.log('- Current timestamp:', currentTime);
//     console.log('- Current time:', new Date().toISOString());
//     console.log('- Input code:', code, typeof code);
    
//     // Générer les codes pour différents moments
//     console.log('📊 Expected codes for different time windows:');
//     for (let offset = -3; offset <= 3; offset++) {
//       const timeStep = currentTime + (offset * 30);
//       const expectedCode = speakeasy.totp({
//         secret: cleanSecret,
//         encoding: 'base32',
//         time: timeStep
//       });
//       const match = expectedCode === code ? ' ← MATCH!' : '';
//       console.log(`  ${offset * 30}s: ${expectedCode}${match}`);
//     }
    
//     // Approche 1: Vérification standard avec fenêtre élargie
//     verified = speakeasy.totp.verify({
//       secret: cleanSecret,
//       encoding: 'base32',
//       token: code,
//       window: 6 // Fenêtre très large pour test
//     });
    
//     console.log('🔐 Standard verification (window=6):', verified);
    
//     // Approche 2: Test direct avec le code entré
//     const manualCode = speakeasy.totp({
//       secret: cleanSecret,
//       encoding: 'base32'
//     });
//     console.log('🎯 Current manual code:', manualCode);
//     console.log('🎯 Manual comparison:', manualCode === code, manualCode === code.toString());
    
//     // Approche 3: Vérifier avec string et number
//     if (!verified) {
//       verified = speakeasy.totp.verify({
//         secret: cleanSecret,
//         encoding: 'base32',
//         token: code.toString(),
//         window: 6
//       });
//       console.log('🔐 String token verification:', verified);
//     }
    
//     // Approche 4: Test avec parseInt
//     if (!verified) {
//       verified = speakeasy.totp.verify({
//         secret: cleanSecret,
//         encoding: 'base32',
//         token: parseInt(code),
//         window: 6
//       });
//       console.log('🔐 parseInt token verification:', verified);
//     }

//     // Si le code normal ne fonctionne pas, vérifier les codes de backup
//     let isBackupCode = false;
//     if (!verified && user.twofa_backup_codes && user.twofa_backup_codes.length > 0) {
//       const backupIndex = user.twofa_backup_codes.indexOf(code.toUpperCase());
//       if (backupIndex !== -1) {
//         isBackupCode = true;
//         console.log('✅ Backup code used');
//         // Supprimer le code de backup utilisé
//         const updatedBackupCodes = user.twofa_backup_codes.filter((_, index) => index !== backupIndex);
//         await pool.query(
//           'UPDATE Utilisateur SET twofa_backup_codes = $1 WHERE id_u = $2',
//           [updatedBackupCodes, user.id_u]
//         );
//       }
//     }

//     // MODE DEBUG TEMPORAIRE - À SUPPRIMER EN PRODUCTION
//     // Accepter le code "123456" pour test
//     if (!verified && !isBackupCode && code === '123456') {
//       console.log('🚨 DEBUG: Accepting test code 123456');
//       verified = true;
//     }

//     if (!verified && !isBackupCode) {
//       console.log('❌ Invalid 2FA code - all verification methods failed');
//       console.log('💡 Try using one of the expected codes shown above, or code 123456 for testing');
//       return res.status(401).json({
//         success: false,
//         message: 'Code 2FA invalide'
//       });
//     }

//     // Si c'est la première configuration, activer le 2FA
//     if (isSetup && !user.twofa_enabled) {
//       await pool.query(
//         'UPDATE Utilisateur SET twofa_enabled = true WHERE id_u = $1',
//         [user.id_u]
//       );
//       console.log('✅ 2FA enabled for user:', user.email);
//     }

//     // Générer le token final
//     const finalToken = jwt.sign(
//       { 
//         userId: user.id_u,
//         email: user.email,
//         role: user.role
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
//     );

//     // Mettre à jour la dernière connexion
//     await pool.query(
//       'UPDATE Utilisateur SET date_derniere_connexion = NOW() WHERE id_u = $1',
//       [user.id_u]
//     );

//     console.log('✅ 2FA verification successful');

//     res.json({
//       success: true,
//       token: finalToken,
//       user: {
//         id: user.id_u,
//         nom: user.nom,
//         prenom: user.prenom,
//         email: user.email,
//         role: user.role,
//         twofa_enabled: true
//       },
//       message: isBackupCode ? 'Connexion avec code de backup réussie' : 'Vérification 2FA réussie'
//     });

//   } catch (error) {
//     console.error('❌ 2FA verification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la vérification 2FA'
//     });
//   }
// };

// // Désactiver le 2FA
// const disableTwoFactor = async (req, res) => {
//   try {
//     const { password } = req.body;
//     const userId = req.user.userId; // Correction ici

//     if (!password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mot de passe requis pour désactiver 2FA'
//       });
//     }

//     // Vérifier le mot de passe
//     const userQuery = 'SELECT password FROM Utilisateur WHERE id_u = $1';
//     const result = await pool.query(userQuery, [userId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Utilisateur non trouvé'
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Mot de passe incorrect'
//       });
//     }

//     // Désactiver le 2FA
//     await pool.query(
//       'UPDATE Utilisateur SET twofa_enabled = false, twofa_secret = NULL, twofa_backup_codes = NULL WHERE id_u = $1',
//       [userId]
//     );

//     res.json({
//       success: true,
//       message: '2FA désactivé avec succès'
//     });

//   } catch (error) {
//     console.error('❌ Disable 2FA error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la désactivation 2FA'
//     });
//   }
// };

// // Génération du token JWT
// const generateToken = (userId, email, role) => {
//   return jwt.sign(
//     { userId, email, role },
//     process.env.JWT_SECRET || 'your_super_secret_jwt_key',
//     { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//   );
// };

// // Inscription
// const register = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Erreurs de validation',
//         errors: errors.array()
//       });
//     }

//     const { nom, prenom, email, password, role = 'patient', telephone, adresse } = req.body;

//     // Vérifier si l'utilisateur existe déjà
//     const userExists = await pool.query(
//       'SELECT id_u FROM utilisateur WHERE email = $1',
//       [email]
//     );

//     if (userExists.rows.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Un utilisateur avec cet email existe déjà'
//       });
//     }

//     // Hasher le mot de passe
//     const saltRounds = 12;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Créer l'utilisateur
//     const result = await pool.query(
//       `INSERT INTO utilisateur (nom, prenom, email, password, role, telephone, adresse, photo, date_derniere_connexion) 
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
//        RETURNING id_u, nom, prenom, email, role`,
//       [nom, prenom, email, hashedPassword, role, telephone, adresse, 'default.jpg']
//     );

//     const newUser = result.rows[0];

//     res.status(201).json({
//       success: true,
//       message: 'Inscription réussie',
//       user: {
//         id: newUser.id_u,
//         nom: newUser.nom,
//         prenom: newUser.prenom,
//         email: newUser.email,
//         role: newUser.role
//       }
//     });

//   } catch (error) {
//     console.error('Erreur d\'inscription:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur interne du serveur lors de l\'inscription'
//     });
//   }
// };

// // Vérifier le profil utilisateur
// const getProfile = async (req, res) => {
//   try {
//     const userResult = await pool.query(
//       'SELECT id_u, nom, prenom, email, role, telephone, adresse, photo, twofa_enabled FROM utilisateur WHERE id_u = $1',
//       [req.user.userId]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Utilisateur non trouvé'
//       });
//     }

//     const user = userResult.rows[0];

//     res.json({
//       success: true,
//       user: {
//         id: user.id_u,
//         nom: user.nom,
//         prenom: user.prenom,
//         email: user.email,
//         role: user.role,
//         telephone: user.telephone,
//         adresse: user.adresse,
//         photo: user.photo,
//         twofa_enabled: user.twofa_enabled
//       }
//     });

//   } catch (error) {
//     console.error('Erreur récupération profil:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la récupération du profil'
//     });
//   }
// };

// module.exports = {
//   login,
//   register,
//   getProfile,
//   generateTwoFactorQR,
//   verifyTwoFactor,
//   disableTwoFactor
// };

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

// Login classique
const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt started');
    
    // Validation des entrées
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('📧 Login attempt for email:', email);

    // Rechercher l'utilisateur
    const userQuery = `
      SELECT id_u, nom, prenom, email, password, role, twofa_enabled, twofa_secret
      FROM Utilisateur 
      WHERE email = $1
    `;
    
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = result.rows[0];
    console.log('👤 User found:', { id: user.id_u, email: user.email, role: user.role });

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Password valid');

    // Vérifier si l'utilisateur est médecin et si 2FA est activé
    if (user.role === 'medecin' && user.twofa_enabled) {
      console.log('🔐 2FA required for doctor');
      
      // Générer un token temporaire pour la vérification 2FA
      const tempToken = jwt.sign(
        { 
          userId: user.id_u, 
          email: user.email,
          role: user.role,
          requires2FA: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // Token temporaire de 10 minutes
      );

      return res.json({
        success: true,
        requires2FA: true,
        tempToken,
        message: 'Veuillez entrer votre code 2FA'
      });
    }

    // Si pas de 2FA requis ou pas médecin, connexion normale
    const token = jwt.sign(
      { 
        userId: user.id_u,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE Utilisateur SET date_derniere_connexion = NOW() WHERE id_u = $1',
      [user.id_u]
    );

    console.log('✅ Login successful');

    res.json({
      success: true,
      token,
      user: {
        id: user.id_u,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
};

// Générer le QR Code pour 2FA
const generateTwoFactorQR = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    // Vérifier que l'utilisateur existe et est médecin
    const userQuery = `
      SELECT id_u, nom, prenom, email, role, twofa_enabled 
      FROM Utilisateur 
      WHERE email = $1 AND role = 'medecin'
    `;
    
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const user = result.rows[0];

    // Générer un secret pour 2FA
    const secret = speakeasy.generateSecret({
      name: `Cabinet Médical - Dr. ${user.prenom} ${user.nom}`,
      issuer: 'Cabinet Médical Premium',
      length: 32
    });

    // Générer des codes de backup
    const backupCodes = generateBackupCodes();

    // Sauvegarder le secret temporairement (sera confirmé lors de la vérification)
    await pool.query(
      'UPDATE Utilisateur SET twofa_secret = $1, twofa_backup_codes = $2 WHERE id_u = $3',
      [secret.base32, backupCodes, user.id_u]
    );

    // Générer le QR Code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    console.log('✅ 2FA QR Code generated for user:', user.email);

    res.json({
      success: true,
      qrCode: qrCodeUrl,
      secret: secret.base32,
      backupCodes: backupCodes,
      message: 'QR Code généré avec succès'
    });

  } catch (error) {
    console.error('❌ Generate 2FA QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du QR Code'
    });
  }
};

// Vérifier le code 2FA
const verifyTwoFactor = async (req, res) => {
  try {
    const { tempToken, code, isSetup = false } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'Token temporaire et code requis'
      });
    }

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

    // Récupérer l'utilisateur
    const userQuery = `
      SELECT id_u, nom, prenom, email, role, twofa_secret, twofa_enabled, twofa_backup_codes
      FROM Utilisateur 
      WHERE id_u = $1
    `;
    
    const result = await pool.query(userQuery, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = result.rows[0];

    if (!user.twofa_secret) {
      return res.status(400).json({
        success: false,
        message: '2FA non configuré'
      });
    }

    // Vérifier le code 2FA
    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token: code,
      window: 2 // Permet une tolérance de ±2 intervalles de temps
    });

    // Si le code normal ne fonctionne pas, vérifier les codes de backup
    let isBackupCode = false;
    if (!verified && user.twofa_backup_codes && user.twofa_backup_codes.length > 0) {
      const backupIndex = user.twofa_backup_codes.indexOf(code.toUpperCase());
      if (backupIndex !== -1) {
        isBackupCode = true;
        // Supprimer le code de backup utilisé
        const updatedBackupCodes = user.twofa_backup_codes.filter((_, index) => index !== backupIndex);
        await pool.query(
          'UPDATE Utilisateur SET twofa_backup_codes = $1 WHERE id_u = $2',
          [updatedBackupCodes, user.id_u]
        );
      }
    }

    if (!verified && !isBackupCode) {
      return res.status(401).json({
        success: false,
        message: 'Code 2FA invalide'
      });
    }

    // Si c'est la première configuration, activer le 2FA
    if (isSetup && !user.twofa_enabled) {
      await pool.query(
        'UPDATE Utilisateur SET twofa_enabled = true WHERE id_u = $1',
        [user.id_u]
      );
      console.log('✅ 2FA enabled for user:', user.email);
    }

    // Générer le token final
    const finalToken = jwt.sign(
      { 
        userId: user.id_u,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE Utilisateur SET date_derniere_connexion = NOW() WHERE id_u = $1',
      [user.id_u]
    );

    console.log('✅ 2FA verification successful');

    res.json({
      success: true,
      token: finalToken,
      user: {
        id: user.id_u,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      },
      message: isBackupCode ? 'Connexion avec code de backup réussie' : 'Vérification 2FA réussie'
    });

  } catch (error) {
    console.error('❌ 2FA verification error:', error);
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

    // Vérifier le mot de passe
    const userQuery = 'SELECT password FROM Utilisateur WHERE id_u = $1';
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
      'UPDATE Utilisateur SET twofa_enabled = false, twofa_secret = NULL, twofa_backup_codes = NULL WHERE id_u = $1',
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
// const login = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Erreurs de validation',
//         errors: errors.array()
//       });
//     }

//     const { email, password, twoFactorCode } = req.body;

//     // Vérifier si l'utilisateur existe
//     const userResult = await pool.query(
//       'SELECT id_u, nom, prenom, email, password, role, deuxfa_code FROM utilisateur WHERE email = $1',
//       [email]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email ou mot de passe incorrect'
//       });
//     }

//     const user = userResult.rows[0];

//     // Vérifier le mot de passe
//     let isPasswordValid = false;
    
//     // Vérifier si le mot de passe est hashé
//     if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
//       isPasswordValid = await bcrypt.compare(password, user.password);
//     } else {
//       // Pour les anciens mots de passe non hashés (temporaire)
//       isPasswordValid = password === user.password;
      
//       // Optionnel: hasher le mot de passe pour la prochaine fois
//       if (isPasswordValid) {
//         const hashedPassword = await bcrypt.hash(password, 12);
//         await pool.query(
//           'UPDATE utilisateur SET password = $1 WHERE id_u = $2',
//           [hashedPassword, user.id_u]
//         );
//       }
//     }

//     if (!isPasswordValid) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email ou mot de passe incorrect'
//       });
//     }

//     // Vérifier le 2FA pour les médecins
//     if (user.role === 'medecin' && user.deuxfa_code) {
//       if (!twoFactorCode) {
//         return res.status(400).json({
//           success: false,
//           message: 'Code d\'authentification à deux facteurs requis',
//           requiresTwoFactor: true
//         });
//       }

//       const verified = speakeasy.totp.verify({
//         secret: user.deuxfa_code,
//         encoding: 'base32',
//         token: twoFactorCode,
//         window: 2
//       });

//       if (!verified) {
//         return res.status(400).json({
//           success: false,
//           message: 'Code d\'authentification à deux facteurs invalide'
//         });
//       }
//     }

//     // Mettre à jour la dernière connexion
//     await pool.query(
//       'UPDATE utilisateur SET date_derniere_connexion = NOW() WHERE id_u = $1',
//       [user.id_u]
//     );

//     // Générer le token
//     const token = generateToken(user.id_u, user.email, user.role);

//     res.json({
//       success: true,
//       message: 'Connexion réussie',
//       data: {
//         user: {
//           id: user.id_u,
//           nom: user.nom,
//           prenom: user.prenom,
//           email: user.email,
//           role: user.role
//         },
//         token
//       }
//     });

//   } catch (error) {
//     console.error('Erreur de connexion:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur interne du serveur lors de la connexion'
//     });
//   }
// };

// // Générer le QR code pour 2FA
// const generateTwoFactorQR = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email requis'
//       });
//     }

//     const secret = speakeasy.generateSecret({
//       name: `Cabinet Medical (${email})`,
//       issuer: 'Cabinet Medical'
//     });

//     // Sauvegarder le secret
//     await pool.query(
//       'UPDATE utilisateur SET deuxfa_code = $1 WHERE email = $2',
//       [secret.base32, email]
//     );

//     // Générer le QR code
//     const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

//     res.json({
//       success: true,
//       message: 'QR code généré avec succès',
//       data: {
//         qrCode: qrCodeUrl,
//         secret: secret.base32
//       }
//     });

//   } catch (error) {
//     console.error('Erreur génération QR 2FA:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la génération du QR code 2FA'
//     });
//   }
// };

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
  login,
  register,
  getProfile,
  generateTwoFactorQR,
  verifyTwoFactor,
  disableTwoFactor
};