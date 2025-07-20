// backend/controllers/adminController.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Dashboard Admin - Statistiques générales
const getDashboardStats = async (req, res) => {
  console.log('🔍 getDashboardStats called');
  console.log('👤 User info:', req.user);
  
  // TEST DEBUG : Vérifier si on arrive bien ici
  if (!req.user) {
    console.log('❌ PROBLÈME: req.user est undefined dans le controller');
    return res.status(401).json({
      success: false,
      message: 'Utilisateur non défini dans le controller'
    });
  }

  if (req.user.role !== 'admin') {
    console.log('❌ PROBLÈME: Le rôle utilisateur n\'est pas admin:', req.user.role);
    return res.status(403).json({
      success: false,
      message: 'Rôle utilisateur incorrect: ' + req.user.role
    });
  }

  console.log('✅ Controller: User is admin, proceeding...')
  
  try {
    // Statistiques utilisateurs
    const userStats = await pool.query(`
      SELECT 
        role,
        COUNT(*) as total,
        COUNT(CASE WHEN date_derniere_connexion >= NOW() - INTERVAL '24 hours' THEN 1 END) as actifs_24h,
        COUNT(CASE WHEN date_derniere_connexion >= NOW() - INTERVAL '7 days' THEN 1 END) as actifs_7j
      FROM Utilisateur 
      GROUP BY role
    `);
    console.log('✅ userStats:', userStats.rows);

    // Statistiques RDV
    const rdvStats = await pool.query(`
      SELECT 
        statut,
        COUNT(*) as total,
        COUNT(CASE WHEN date_rend::date = CURRENT_DATE THEN 1 END) as aujourdhui
      FROM RendezVous 
      GROUP BY statut
    `);
    console.log('✅ rdvStats:', rdvStats.rows);

    // Statistiques consultations
    const consultationStats = await pool.query(`
      SELECT 
        COUNT(*) as total_consultations,
        COUNT(CASE WHEN date_c::date = CURRENT_DATE THEN 1 END) as consultations_aujourdhui,
        COUNT(CASE WHEN date_c >= NOW() - INTERVAL '30 days' THEN 1 END) as consultations_30j
      FROM Consultation
    `);
    console.log('✅ consultationStats:', consultationStats.rows);

    // Statistiques financières
    const financialStats = await pool.query(`
      SELECT 
        COALESCE(SUM(prix), 0) as revenus_total,
        COALESCE(SUM(CASE WHEN date_f::date = CURRENT_DATE THEN prix ELSE 0 END), 0) as revenus_aujourdhui,
        COALESCE(SUM(CASE WHEN date_f >= NOW() - INTERVAL '30 days' THEN prix ELSE 0 END), 0) as revenus_30j,
        COUNT(CASE WHEN statut = 'payée' THEN 1 END) as factures_payees,
        COUNT(CASE WHEN statut = 'en attente' THEN 1 END) as factures_en_attente
      FROM Facture
    `);
    console.log('✅ financialStats:', financialStats.rows);

    // Activité système récente
    const recentActivity = await pool.query(`
      SELECT 
        u.nom, u.prenom, u.role,
        u.date_derniere_connexion
      FROM Utilisateur u
      WHERE u.date_derniere_connexion IS NOT NULL
      ORDER BY u.date_derniere_connexion DESC
      LIMIT 10
    `);
    console.log('✅ recentActivity:', recentActivity.rows);
 
// 30 derniers jours de consultations groupés par jour
      const dailyConsultations = await pool.query(`
        SELECT 
          TO_CHAR(date_c, 'YYYY-MM-DD') as date,
          COUNT(*) as total
        FROM Consultation
        WHERE date_c >= NOW() - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date ASC
      `);


      // 30 derniers jours de revenus groupés par jour
      const dailyRevenus = await pool.query(`
        SELECT 
          TO_CHAR(date_f, 'YYYY-MM-DD') as date,
          COALESCE(SUM(prix), 0) as montant
        FROM Facture
        WHERE date_f >= NOW() - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date ASC
      `);



    const responseData = {
  success: true,
  data: {
    userStats: userStats.rows,
    rdvStats: rdvStats.rows,
    consultationStats: {
      ...(consultationStats.rows[0] || {
        total_consultations: 0,
        consultations_aujourdhui: 0,
        consultations_30j: 0
      }),
      daily_stats: dailyConsultations.rows
    },
    financialStats: {
      ...(financialStats.rows[0] || {
        revenus_total: 0,
        revenus_aujourdhui: 0,
        revenus_30j: 0,
        factures_payees: 0,
        factures_en_attente: 0
      }),
      daily_revenus: dailyRevenus.rows
    },
    recentActivity: recentActivity.rows
  }
};

    console.log('✅ Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};


// Gestion des utilisateurs - Liste
const getUsers = async (req, res) => {
  console.log('🔍 getUsers called');
  console.log('Query params:', req.query);
  console.log('User info:', req.user);
  
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id_u, u.nom, u.prenom, u.email, u.role, u.telephone, 
        u.adresse, u.date_derniere_connexion, u.photo
      FROM Utilisateur u
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND u.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (search) {
      query += ` AND (u.nom ILIKE $${paramIndex} OR u.prenom ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY u.date_derniere_connexion DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    console.log('📝 Query:', query);
    console.log('📝 Params:', params);

    const users = await pool.query(query, params);
    console.log('✅ Users found:', users.rows.length);

    // Compter le total
    let countQuery = 'SELECT COUNT(*) FROM Utilisateur u WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (role) {
      countQuery += ` AND u.role = $${countParamIndex}`;
      countParams.push(role);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (u.nom ILIKE $${countParamIndex} OR u.prenom ILIKE $${countParamIndex} OR u.email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const totalResult = await pool.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].count);
    console.log('✅ Total users:', total);

    const responseData = {
      success: true,
      data: {
        users: users.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: (page * limit) < total,
          hasPrev: page > 1
        }
      }
    };

    console.log('✅ Sending response with', users.rows.length, 'users');
    res.json(responseData);

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  console.log('🔍 createUser called with data:', req.body);

  try {
    const {
      nom,
      prenom,
      email,
      password,
      role = 'patient',
      telephone = null,
      adresse = null,
      photo = 'default.jpg'
    } = req.body;

    // Validation des champs obligatoires
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, prénom, email et mot de passe sont obligatoires'
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Validation mot de passe (doit respecter contrainte PostgreSQL ≥ 8)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Validation du rôle (doit correspondre au CHECK PostgreSQL)
    const validRoles = ['admin', 'medecin', 'secretaire', 'patient'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Le rôle doit être parmi : ${validRoles.join(', ')}`
      });
    }

    // Vérifier si email déjà existant
    const existingUser = await pool.query(
      'SELECT id_u FROM Utilisateur WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertion
    const insertQuery = `
      INSERT INTO Utilisateur 
        (nom, prenom, email, password, role, telephone, adresse, photo) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_u, nom, prenom, email, role, telephone, adresse, photo
    `;

    const values = [
      nom.trim(),
      prenom.trim(),
      email.trim().toLowerCase(),
      hashedPassword,
      role,
      telephone,
      adresse,
      photo
    ];

    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0];

    console.log('✅ Utilisateur créé avec succès:', newUser);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: newUser
    });

  } catch (error) {
    console.error('❌ Create user error:', error);

    // Gestion erreurs SQL spécifiques (conflit UNIQUE, etc.)
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne lors de la création de l\'utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, telephone, adresse } = req.body;

    const result = await pool.query(
      `UPDATE Utilisateur
       SET nom = $1, prenom = $2, email = $3, role = $4, telephone = $5, adresse = $6
       WHERE id_u = $7
       RETURNING id_u, nom, prenom, email, role`,
      [nom, prenom, email, role, telephone, adresse, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }

    res.json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'utilisateur"
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM Utilisateur WHERE id_u = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur",
    });
  }
};

// const generateReport = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       message: 'Rapport généré (fictif)',
//       data: {
//         date: new Date(),
//         entries: [],
//       },
//     });
//   } catch (error) {
//     console.error('Generate report error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la génération du rapport',
//     });
//   }
// };
const generateReport = async (req, res) => {
  try {
    console.log('📊 Generate report request:', req.query);

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur requis'
      });
    }

    // Récupérer les infos utilisateur depuis la table Utilisateur
    const userQuery = `
      SELECT 
        id_u, nom, prenom, email, role, telephone, adresse, 
        date_derniere_connexion
      FROM utilisateur 
      WHERE id_u = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = userResult.rows[0];

    // Total des consultations liées à l'utilisateur (en tant que patient)
    const consultationsQuery = `
      SELECT COUNT(*) AS total_consultations
      FROM consultation
      WHERE id_patient = $1
    `;

    // Statistiques de rendez-vous groupés par statut
    const rdvQuery = `
      SELECT COUNT(*) AS total_rdv, statut
      FROM rendezvous
      WHERE id_patient = $1
      GROUP BY statut
    `;

    const consultationsResult = await pool.query(consultationsQuery, [userId]);
    const rdvResult = await pool.query(rdvQuery, [userId]);

    // Construction du rapport
    const reportData = {
      dateGeneration: new Date().toISOString(),
      utilisateur: {
        id: user.id_u,
        nom: user.nom || 'Non renseigné',
        prenom: user.prenom || 'Non renseigné',
        email: user.email || 'Non renseigné',
        role: user.role || 'Non renseigné',
        telephone: user.telephone || 'Non renseigné',
        adresse: user.adresse || 'Non renseignée',
        dateCreation: 'Non disponible', // À ajouter dans la DB si nécessaire
        derniereConnexion: user.date_derniere_connexion || 'Jamais connecté'
      },
      statistiques: {
        totalConsultations: parseInt(consultationsResult.rows[0]?.total_consultations || 0, 10),
        rendezVous: rdvResult.rows || [],
        derniereActivite: user.date_derniere_connexion || 'Aucune activité'
      }
    };

    console.log('✅ Rapport généré pour l’utilisateur:', userId);

    return res.status(200).json({
      success: true,
      message: 'Rapport généré avec succès',
      data: reportData
    });

  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne lors de la génération du rapport',
      error: error.message
    });
  }
};

// À ajouter dans adminController.js après les autres fonctions

const getSystemSettings = async (req, res) => {
  try {
    const settings = await pool.query(`
      SELECT cle, valeur, description 
      FROM parametres_systeme
      ORDER BY cle
    `);
    
    // Convertir en objet avec clé => valeur
    const settingsObj = {};
    settings.rows.forEach(row => {
      settingsObj[row.cle] = {
        value: row.valeur,
        description: row.description
      };
    });
    
    res.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres'
    });
  }
};

// Mettre à jour les paramètres système
const updateSystemSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // Commencer une transaction
    await pool.query('BEGIN');
    
    // Mettre à jour chaque paramètre
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(`
        INSERT INTO parametres_systeme (cle, valeur, description, date_mise_a_jour)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (cle) 
        DO UPDATE SET 
          valeur = EXCLUDED.valeur,
          date_mise_a_jour = NOW()
      `, [key, value.toString(), getSettingDescription(key)]);
    }
    
    // Valider la transaction
    await pool.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Paramètres mis à jour avec succès'
    });
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await pool.query('ROLLBACK');
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres'
    });
  }
};

// Helper function pour obtenir la description d'un paramètre
const getSettingDescription = (key) => {
  const descriptions = {
    'site_name': 'Nom du site web',
    'dark_mode': 'Mode sombre activé/désactivé',
    'maintenance_mode': 'Mode maintenance activé/désactivé',
    'font_family': 'Police de caractères utilisée',
    'font_size': 'Taille de la police',
    'primary_color': 'Couleur primaire du site'
  };
  return descriptions[key] || 'Paramètre système';
};

// Initialiser les paramètres par défaut
const initializeSystemSettings = async (req, res) => {
  try {
    const defaultSettings = {
      'site_name': 'Cabinet Médical',
      'dark_mode': 'false',
      'maintenance_mode': 'false',
      'font_family': 'Inter',
      'font_size': '16px',
      'primary_color': '#3b82f6'
    };

    await pool.query('BEGIN');
    
    for (const [key, value] of Object.entries(defaultSettings)) {
      await pool.query(`
        INSERT INTO parametres_systeme (cle, valeur, description, date_creation)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (cle) DO NOTHING
      `, [key, value, getSettingDescription(key)]);
    }
    
    await pool.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Paramètres initialisés avec succès'
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erreur lors de l\'initialisation des paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation des paramètres'
    });
  }
};

// À ajouter dans le module.exports
module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  generateReport,
  getSystemSettings,
  updateSystemSettings,
  initializeSystemSettings
};