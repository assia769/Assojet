// backend/routes/doctor.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect, requireDoctorOrAdmin } = require('../middleware/auth'); 

const upload = require('../middleware/upload'); 
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Middleware pour vérifier que l'utilisateur est médecin
// Option 1: Utiliser les middlewares du fichier auth.js
router.use(protect, requireDoctorOrAdmin);

// backend/routes/auth.js - Modification de la route login

// ✅ Route de login modifiée pour gérer la 2FA seulement pour les médecins
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    console.log('🔐 Login attempt for:', email);

    // Vérifier l'utilisateur
    const userResult = await pool.query(
      'SELECT * FROM Utilisateur WHERE email = $1',
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

    // ✅ MODIFICATION: Vérifier si 2FA requis SEULEMENT pour les médecins
    const isMedecin = user.role === 'medecin';
    
    if (isMedecin) {
      console.log('👨‍⚕️ User is a doctor - checking 2FA requirement');
      
      // Pour les médecins, vérifier si 2FA est activé
      if (user.twofa_enabled) {
        console.log('🔐 Doctor has 2FA enabled - requiring verification');
        
        // Générer token temporaire pour vérification 2FA
        const tempToken = jwt.sign(
          { 
            userId: user.id_u, 
            email: user.email,
            requiresVerification: true,
            role: user.role
          },
          process.env.JWT_SECRET,
          { expiresIn: '10m' }
        );

        return res.json({
          success: true,
          requires2FA: true,
          tempToken,
          user: {
            id: user.id_u,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            twofa_enabled: user.twofa_enabled
          },
          message: 'Veuillez entrer votre code 2FA'
        });
      } else {
        console.log('🔧 Doctor does not have 2FA - requiring setup');
        
        // Médecin sans 2FA - forcer la configuration
        const tempToken = jwt.sign(
          { 
            userId: user.id_u, 
            email: user.email,
            requiresSetup: true,
            role: user.role
          },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );

        return res.json({
          success: true,
          requires2FA: true,
          tempToken,
          user: {
            id: user.id_u,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            twofa_enabled: false
          },
          message: 'Configuration 2FA requise pour les médecins'
        });
      }
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

      const userData = {
        id: user.id_u,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        telephone: user.telephone,
        photo: user.photo
      };

      console.log('✅ Direct login successful for non-doctor');

      return res.json({
        success: true,
        requires2FA: false, // ✅ Pas de 2FA pour les non-médecins
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
});

// ✅ Route alternative pour bypass 2FA (si nécessaire)
router.post('/login-bypass-2fa', async (req, res) => {
  try {
    const { email, password, bypassReason } = req.body;

    console.log('⚠️ 2FA Bypass attempt for:', email, 'Reason:', bypassReason);

    // Vérifications similaires...
    const userResult = await pool.query(
      'SELECT * FROM Utilisateur WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const user = userResult.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // ✅ Permettre bypass seulement pour les non-médecins
    if (user.role === 'medecin') {
      return res.status(403).json({
        success: false,
        message: '2FA obligatoire pour les médecins'
      });
    }

    // Connexion directe pour non-médecins
    const token = jwt.sign(
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
      photo: user.photo
    };

    res.json({
      success: true,
      token,
      user: userData,
      message: 'Connexion bypass réussie'
    });

  } catch (error) {
    console.error('❌ Bypass login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});
// Dashboard - Statistiques générales
router.get('/dashboard', async (req, res) => {
  try {
    console.log('🔍 Dashboard request from user:', req.user);
    
    // Rendez-vous d'aujourd'hui
    const todayAppointments = await pool.query(`
      SELECT COUNT(*) as count 
      FROM RendezVous rv 
      JOIN Medecin m ON rv.id_medecin = m.id_m 
      WHERE m.id_u = $1 AND DATE(rv.date_rend) = CURRENT_DATE
    `, [req.user.id]);

    // Consultations du mois
    const monthConsultations = await pool.query(`
      SELECT COUNT(*) as count 
      FROM Consultation c 
      JOIN Medecin m ON c.id_medecin = m.id_m 
      WHERE m.id_u = $1 AND EXTRACT(MONTH FROM c.date_c) = EXTRACT(MONTH FROM CURRENT_DATE)
    `, [req.user.id]);

    // Patients totaux
    const totalPatients = await pool.query(`
      SELECT COUNT(DISTINCT c.id_patient) as count 
      FROM Consultation c 
      JOIN Medecin m ON c.id_medecin = m.id_m 
      WHERE m.id_u = $1
    `, [req.user.id]);

    // Messages non lus
    const unreadMessages = await pool.query(`
      SELECT COUNT(*) as count 
      FROM Message 
      WHERE id_destinataire = $1 AND lu = false
    `, [req.user.id]);

    // Prochains rendez-vous
    const upcomingAppointments = await pool.query(`
      SELECT rv.*, u.nom, u.prenom, u.photo
      FROM RendezVous rv
      JOIN Patient p ON rv.id_patient = p.id_p
      JOIN Utilisateur u ON p.id_u = u.id_u
      JOIN Medecin m ON rv.id_medecin = m.id_m
      WHERE m.id_u = $1 AND rv.date_rend > NOW()
      ORDER BY rv.date_rend ASC
      LIMIT 5
    `, [req.user.id]);

    res.json({
      stats: {
        todayAppointments: todayAppointments.rows[0].count,
        monthConsultations: monthConsultations.rows[0].count,
        totalPatients: totalPatients.rows[0].count,
        unreadMessages: unreadMessages.rows[0].count
      },
      upcomingAppointments: upcomingAppointments.rows
    });
  } catch (error) {
    console.error('Erreur dashboard médecin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Liste des patients
router.get('/patients', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT DISTINCT u.*, p.*, COUNT(c.id_cons) as total_consultations,
             MAX(c.date_c) as derniere_consultation
      FROM Utilisateur u
      JOIN Patient p ON u.id_u = p.id_u
      LEFT JOIN Consultation c ON p.id_p = c.id_patient
      JOIN Medecin m ON c.id_medecin = m.id_m
      WHERE m.id_u = $1
    `;
    
    const params = [req.user.id];
    
    if (search) {
      query += ` AND (u.nom ILIKE $2 OR u.prenom ILIKE $2 OR u.email ILIKE $2)`;
      params.push(`%${search}%`);
    }
    
    query += `
      GROUP BY u.id_u, p.id_p
      ORDER BY MAX(c.date_c) DESC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    
    const patients = await pool.query(query, params);
    
    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(DISTINCT u.id_u) as total
      FROM Utilisateur u
      JOIN Patient p ON u.id_u = p.id_u
      LEFT JOIN Consultation c ON p.id_p = c.id_patient
      JOIN Medecin m ON c.id_medecin = m.id_m
      WHERE m.id_u = $1
    `;
    
    const countParams = [req.user.id];
    if (search) {
      countQuery += ` AND (u.nom ILIKE $2 OR u.prenom ILIKE $2 OR u.email ILIKE $2)`;
      countParams.push(`%${search}%`);
    }
    
    const totalCount = await pool.query(countQuery, countParams);
    
    res.json({
      patients: patients.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].total),
        totalPages: Math.ceil(totalCount.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur liste patients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Détails d'un patient
router.get('/patients/:patientId', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Informations du patient
    const patientInfo = await pool.query(`
      SELECT u.*, p.*
      FROM Utilisateur u
      JOIN Patient p ON u.id_u = p.id_u
      WHERE p.id_p = $1
    `, [patientId]);
    
    if (patientInfo.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    // Historique des consultations
    const consultations = await pool.query(`
      SELECT c.*, rv.motif, rv.type
      FROM Consultation c
      JOIN RendezVous rv ON c.id_r = rv.id_r
      JOIN Medecin m ON c.id_medecin = m.id_m
      WHERE c.id_patient = $1 AND m.id_u = $2
      ORDER BY c.date_c DESC
    `, [patientId, req.user.id]);
    
    // Dossier médical
    const medicalRecord = await pool.query(`
      SELECT dm.*, fm.type_fichier, fm.chemin
      FROM DossierMedical dm
      LEFT JOIN FichierMedical fm ON dm.id_d = fm.id_d
      WHERE dm.id_patient = $1
    `, [patientId]);
    
    // Prescriptions actives
    const prescriptions = await pool.query(`
      SELECT p.*, c.date_c
      FROM Prescription p
      JOIN Consultation c ON p.id_cons = c.id_cons
      JOIN Medecin m ON c.id_medecin = m.id_m
      WHERE c.id_patient = $1 AND m.id_u = $2
      ORDER BY c.date_c DESC
      LIMIT 10
    `, [patientId, req.user.id]);
    
    res.json({
      patient: patientInfo.rows[0],
      consultations: consultations.rows,
      medicalRecord: medicalRecord.rows[0] || null,
      medicalFiles: medicalRecord.rows.filter(row => row.type_fichier),
      prescriptions: prescriptions.rows
    });
  } catch (error) {
    console.error('Erreur détails patient:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer une consultation
router.post('/consultations', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { appointmentId, diagnostic, compte_rendu, prescriptions, examens } = req.body;
    
    // Vérifier que le RDV existe et appartient au médecin
    const appointment = await client.query(`
      SELECT rv.*, m.id_m
      FROM RendezVous rv
      JOIN Medecin m ON rv.id_medecin = m.id_m
      WHERE rv.id_r = $1 AND m.id_u = $2
    `, [appointmentId, req.user.id]);
    
    if (appointment.rows.length === 0) {
      throw new Error('Rendez-vous non trouvé');
    }
    
    const rdv = appointment.rows[0];
    
    // Créer la consultation
    const consultation = await client.query(`
      INSERT INTO Consultation (id_r, id_patient, id_medecin, date_c, compte_rendu, diagnostic)
      VALUES ($1, $2, $3, NOW(), $4, $5)
      RETURNING *
    `, [appointmentId, rdv.id_patient, rdv.id_m, compte_rendu, diagnostic]);
    
    const consultationId = consultation.rows[0].id_cons;
    
    // Ajouter les prescriptions
    if (prescriptions && prescriptions.length > 0) {
      for (const prescription of prescriptions) {
        await client.query(`
          INSERT INTO Prescription (id_cons, medicament, dose, duree)
          VALUES ($1, $2, $3, $4)
        `, [consultationId, prescription.medicament, prescription.dose, prescription.duree]);
      }
    }
    
    // Ajouter les examens
    if (examens && examens.length > 0) {
      for (const examen of examens) {
        await client.query(`
          INSERT INTO Examen (id_cons, type_examen, date_examen, resultat)
          VALUES ($1, $2, $3, $4)
        `, [consultationId, examen.type_examen, examen.date_examen, examen.resultat]);
      }
    }
    
    // Mettre à jour le statut du RDV
    await client.query(`
      UPDATE RendezVous SET statut = 'terminé' WHERE id_r = $1
    `, [appointmentId]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Consultation créée avec succès',
      consultation: consultation.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur création consultation:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  } finally {
    client.release();
  }
});

// Test route pour vérifier que le middleware fonctionne
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor route accessible',
    user: req.user
  });
});
// 🔥 Statistiques globales
router.get('/statistics', async (req, res) => {
  try {
    const doctor = await pool.query('SELECT id_m FROM Medecin WHERE id_u = $1', [req.user.id]);
    const id_m = doctor.rows[0]?.id_m;
    const period = req.query.period || 'month';

    const [totalConsultations, prevConsultations] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM Consultation WHERE id_medecin = $1 AND date_c >= date_trunc($2, CURRENT_DATE)', [id_m, period]),
      pool.query(`
        SELECT COUNT(*) FROM Consultation
        WHERE id_medecin = $1
        AND date_c >= date_trunc($2, CURRENT_DATE - ('1 ' || $2)::interval)
        AND date_c < date_trunc($2, CURRENT_DATE)
      `, [id_m, period])
    ]);

    const [totalPatients, newPatients] = await Promise.all([
      pool.query('SELECT COUNT(DISTINCT id_patient) FROM Consultation WHERE id_medecin = $1', [id_m]),
      pool.query('SELECT COUNT(DISTINCT id_patient) FROM Consultation WHERE id_medecin = $1 AND date_c >= date_trunc($2, CURRENT_DATE)', [id_m, period])
    ]);

    const prescriptions = await pool.query('SELECT COUNT(*) FROM Prescription p JOIN Consultation c ON p.id_cons = c.id_cons WHERE c.id_medecin = $1 AND c.date_c >= date_trunc($2, CURRENT_DATE)', [id_m, period]);

    const presence = await pool.query(`
      SELECT 
        COUNT(CASE WHEN rv.statut = 'terminé' THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100 AS taux
      FROM RendezVous rv
      WHERE rv.id_medecin = $1 AND rv.date_rend >= date_trunc($2, CURRENT_DATE)
    `, [id_m, period]);

    res.json({
      totalConsultations: parseInt(totalConsultations.rows[0].count),
      consultationsChange: totalConsultations.rows[0].count - prevConsultations.rows[0].count,
      nouveauxPatients: parseInt(newPatients.rows[0].count),
      patientsChange: parseInt(newPatients.rows[0].count),
      totalPrescriptions: parseInt(prescriptions.rows[0].count),
      prescriptionsChange: parseInt(prescriptions.rows[0].count),
      tauxPresence: parseFloat(presence.rows[0].taux || 0).toFixed(1),
      dureeMoyenneConsultation: 12,
      revenusMois: 2800,
      satisfactionMoyenne: 4.5
    });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: 'Erreur statistiques' });
  }
});

// 📊 Évolution des consultations
router.get('/statistics/consultations', async (req, res) => {
  const { start, end } = req.query;
  try {
    const doctor = await pool.query('SELECT id_m FROM Medecin WHERE id_u = $1', [req.user.id]);
    const id_m = doctor.rows[0]?.id_m;

    const result = await pool.query(`
      SELECT TO_CHAR(date_c, 'YYYY-MM-DD') AS date, COUNT(*) AS count
      FROM Consultation
      WHERE id_medecin = $1 AND date_c::date BETWEEN $2 AND $3
      GROUP BY date
      ORDER BY date
    `, [id_m, start, end]);

    res.json(result.rows);
  } catch (err) {
    console.error('Consultation stats error:', err);
    res.status(500).json({ error: 'Erreur statistiques consultations' });
  }
});

// 📌 Pathologies fréquentes
router.get('/statistics/pathologies', async (req, res) => {
  try {
    const doctor = await pool.query('SELECT id_m FROM Medecin WHERE id_u = $1', [req.user.id]);
    const id_m = doctor.rows[0]?.id_m;

    const pathologies = await pool.query(`
      SELECT diagnostic AS nom, COUNT(*) AS count
      FROM Consultation
      WHERE id_medecin = $1 AND diagnostic IS NOT NULL
      GROUP BY diagnostic
      ORDER BY count DESC
      LIMIT 10
    `, [id_m]);

    res.json(pathologies.rows);
  } catch (err) {
    console.error('Pathologies error:', err);
    res.status(500).json({ error: 'Erreur pathologies' });
  }
});

// 👥 Statistiques patients
router.get('/statistics/patients', async (req, res) => {
  try {
    const doctor = await pool.query('SELECT id_m FROM Medecin WHERE id_u = $1', [req.user.id]);
    const id_m = doctor.rows[0]?.id_m;

    const [actifs, nouveaux, ages, sexes] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT id_patient) FROM Consultation WHERE id_medecin = $1`, [id_m]),
      pool.query(`SELECT COUNT(DISTINCT id_patient) FROM Consultation WHERE id_medecin = $1 AND date_c >= date_trunc('month', CURRENT_DATE)`, [id_m]),
      pool.query(`SELECT ROUND(AVG(EXTRACT(YEAR FROM AGE(u.date_naiss)))) AS age FROM Consultation c JOIN Patient p ON c.id_patient = p.id_p JOIN Utilisateur u ON u.id_u = p.id_u WHERE c.id_medecin = $1`, [id_m]),
      pool.query(`SELECT p.sexe, COUNT(*) FROM Consultation c JOIN Patient p ON c.id_patient = p.id_p WHERE c.id_medecin = $1 GROUP BY p.sexe`, [id_m])
    ]);

    const genreData = sexes.rows.reduce((acc, row) => {
      if (row.sexe === 'M') acc.hommes = parseInt(row.count);
      else if (row.sexe === 'F') acc.femmes = parseInt(row.count);
      return acc;
    }, { hommes: 0, femmes: 0 });

    const totalGenre = genreData.hommes + genreData.femmes;

    res.json({
      actifs: parseInt(actifs.rows[0].count),
      nouveauxCeMois: parseInt(nouveaux.rows[0].count),
      ageMoyen: parseInt(ages.rows[0].age),
      hommes: genreData.hommes,
      femmes: genreData.femmes,
      pourcentageHommes: ((genreData.hommes / totalGenre) * 100).toFixed(1),
      pourcentageFemmes: ((genreData.femmes / totalGenre) * 100).toFixed(1)
    });
  } catch (err) {
    console.error('Patients stats error:', err);
    res.status(500).json({ error: 'Erreur patients stats' });
  }
});

module.exports = router;