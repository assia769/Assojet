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

    const responseData = {
      success: true,
      data: {
        userStats: userStats.rows,
        rdvStats: rdvStats.rows,
        consultationStats: consultationStats.rows[0] || {
          total_consultations: 0,
          consultations_aujourdhui: 0,
          consultations_30j: 0
        },
        financialStats: financialStats.rows[0] || {
          revenus_total: 0,
          revenus_aujourdhui: 0,
          revenus_30j: 0,
          factures_payees: 0,
          factures_en_attente: 0
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

// Reste du code inchangé...
const createUser = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, telephone, adresse } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await pool.query(
      'SELECT id_u FROM Utilisateur WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur
    const insertQuery = `
      INSERT INTO Utilisateur (nom, prenom, email, password, role, telephone, adresse)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_u, nom, prenom, email, role
    `;
    const values = [nom, prenom, email, hashedPassword, role, telephone, adresse];
    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de utilisateur'
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

const generateReport = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Rapport généré (fictif)',
      data: {
        date: new Date(),
        entries: [],
      },
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport',
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  generateReport
};