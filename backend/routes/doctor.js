// backend/routes/doctor.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect, requireDoctorOrAdmin } = require('../middleware/auth'); 
const jwt = require('jsonwebtoken');

const upload = require('../middleware/upload'); 
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Middleware pour vérifier que l'utilisateur est médecin
// Option 1: Utiliser les middlewares du fichier auth.js
router.use(protect, requireDoctorOrAdmin);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ Token manquant dans la requête');
    return res.status(401).json({ 
      success: false,
      message: 'Token d\'accès requis' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.log('❌ Token invalide:', err.message);
      return res.status(403).json({ 
        success: false,
        message: 'Token invalide ou expiré' 
      });
    }
    
    console.log('✅ Token valide pour utilisateur:', user.id);
    req.user = user;
    next();
  });
};
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

// Liste des patients du medecins et n'ont pas tous les patients c'est commenté 
router.get('/patients', async (req, res) => {
  try {
    const { search, page = 1, limit = 100 } = req.query;
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

router.post('/consultations', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { 
      appointmentId, 
      patientId, 
      diagnostic, 
      compte_rendu, 
      prescriptions, 
      examens,
      motif,
      symptomes,
      traitement,
      notes,
      examenPhysique,
      temperature,
      tension,
      pouls,
      poids,
      taille
    } = req.body;
    
    let rdv = null;
    let consultationPatientId = null;
    let medecinId = null;

    // Récupérer l'ID du médecin connecté
    const medecin = await client.query(`
      SELECT id_m FROM Medecin WHERE id_u = $1
    `, [req.user.id]);

    if (medecin.rows.length === 0) {
      throw new Error('Médecin non trouvé');
    }

    medecinId = medecin.rows[0].id_m;
    
    if (appointmentId) {
      // Cas avec rendez-vous existant
      const appointment = await client.query(`
        SELECT rv.*, m.id_m
        FROM RendezVous rv
        JOIN Medecin m ON rv.id_medecin = m.id_m
        WHERE rv.id_r = $1 AND m.id_u = $2
      `, [appointmentId, req.user.id]);
      
      if (appointment.rows.length === 0) {
        throw new Error('Rendez-vous non trouvé');
      }
      
      rdv = appointment.rows[0];
      consultationPatientId = rdv.id_patient;
    } else if (patientId) {
      // Cas sans rendez-vous - consultation directe
      consultationPatientId = patientId;
      
      // Vérifier que le patient existe
      const patient = await client.query(`
        SELECT id_p FROM Patient WHERE id_p = $1
      `, [patientId]);
      
      if (patient.rows.length === 0) {
        throw new Error('Patient non trouvé');
      }
    } else {
      throw new Error('appointmentId ou patientId requis');
    }
    
    // Construire le compte rendu complet
    const compteRenduComplet = compte_rendu || `
Motif: ${motif || 'Non spécifié'}
Symptômes: ${symptomes || 'Aucun'}
Examen physique: ${examenPhysique || 'Non réalisé'}
Signes vitaux:
- Température: ${temperature ? temperature + '°C' : 'Non mesurée'}
- Tension artérielle: ${tension || 'Non mesurée'}  
- Pouls: ${pouls ? pouls + ' bpm' : 'Non mesuré'}
- Poids: ${poids ? poids + ' kg' : 'Non mesuré'}
- Taille: ${taille ? taille + ' cm' : 'Non mesurée'}
Traitement: ${traitement || 'Aucun traitement prescrit'}
Notes complémentaires: ${notes || 'Aucune note'}
    `.trim();
    
    // Créer la consultation
    const consultationQuery = appointmentId ? 
      `INSERT INTO Consultation (id_r, id_patient, id_medecin, date_c, compte_rendu, diagnostic)
       VALUES ($1, $2, $3, NOW(), $4, $5)
       RETURNING *` :
      `INSERT INTO Consultation (id_patient, id_medecin, date_c, compte_rendu, diagnostic)
       VALUES ($1, $2, NOW(), $3, $4)
       RETURNING *`;
    
    const consultationParams = appointmentId ? 
      [appointmentId, consultationPatientId, medecinId, compteRenduComplet, diagnostic] :
      [consultationPatientId, medecinId, compteRenduComplet, diagnostic];
    
    const consultation = await client.query(consultationQuery, consultationParams);
    const consultationId = consultation.rows[0].id_cons;
    
    // Ajouter les prescriptions si fournies
    if (prescriptions && prescriptions.length > 0) {
      for (const prescription of prescriptions) {
        await client.query(`
          INSERT INTO Prescription (id_cons, medicament, dose, duree)
          VALUES ($1, $2, $3, $4)
        `, [consultationId, prescription.medicament, prescription.dose, prescription.duree]);
      }
    }
    
    // Ajouter les examens si fournis
    if (examens && examens.length > 0) {
      for (const examen of examens) {
        await client.query(`
          INSERT INTO Examen (id_cons, type_examen, date_examen, resultat)
          VALUES ($1, $2, $3, $4)
        `, [consultationId, examen.type_examen, examen.date_examen, examen.resultat]);
      }
    }
    
    // Mettre à jour le statut du RDV si c'était depuis un rendez-vous
    if (appointmentId) {
      await client.query(`
        UPDATE RendezVous SET statut = 'terminé' WHERE id_r = $1
      `, [appointmentId]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Consultation créée avec succès',
      consultation: consultation.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur création consultation:', error);
    res.status(500).json({ 
      message: error.message || 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});
// Route pour obtenir une consultation par appointmentId (pour édition)
router.get('/consultations/appointment/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    
    // Vérifier que le RDV existe et appartient au médecin
    const appointment = await pool.query(`
      SELECT rv.*, m.id_m, u.nom, u.prenom, u.telephone, p.age
      FROM RendezVous rv
      JOIN Medecin m ON rv.id_medecin = m.id_m
      JOIN Patient p ON rv.id_patient = p.id_p
      JOIN Utilisateur u ON p.id_u = u.id_u
      WHERE rv.id_r = $1 AND m.id_u = $2
    `, [appointmentId, req.user.id]);
    
    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    
    const rdv = appointment.rows[0];
    
    // Chercher si une consultation existe déjà pour ce RDV
    const existingConsultation = await pool.query(`
      SELECT * FROM Consultation WHERE id_r = $1
    `, [appointmentId]);
    
    res.json({
      patient: {
        id_p: rdv.id_patient,
        nom: rdv.nom,
        prenom: rdv.prenom,
        telephone: rdv.telephone,
        age: rdv.age
      },
      consultation: existingConsultation.rows[0] || null
    });
  } catch (error) {
    console.error('Erreur consultation par appointment:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour mettre à jour une consultation
router.put('/consultations/:consultationId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const consultationId = req.params.consultationId;
    const { 
      diagnostic, 
      compte_rendu, 
      motif,
      symptomes,
      traitement,
      notes,
      examenPhysique,
      temperature,
      tension,
      pouls,
      poids,
      taille
    } = req.body;
    
    // Vérifier que la consultation appartient au médecin
    const consultation = await client.query(`
      SELECT c.*, m.id_u
      FROM Consultation c
      JOIN Medecin m ON c.id_medecin = m.id_m
      WHERE c.id_cons = $1 AND m.id_u = $2
    `, [consultationId, req.user.id]);
    
    if (consultation.rows.length === 0) {
      throw new Error('Consultation non trouvée');
    }
    
    // Construire le compte rendu complet
    const compteRenduComplet = compte_rendu || `
Motif: ${motif || 'Non spécifié'}
Symptômes: ${symptomes || 'Aucun'}
Examen physique: ${examenPhysique || 'Non réalisé'}
Signes vitaux:
- Température: ${temperature ? temperature + '°C' : 'Non mesurée'}
- Tension artérielle: ${tension || 'Non mesurée'}  
- Pouls: ${pouls ? pouls + ' bpm' : 'Non mesuré'}
- Poids: ${poids ? poids + ' kg' : 'Non mesuré'}
- Taille: ${taille ? taille + ' cm' : 'Non mesurée'}
Traitement: ${traitement || 'Aucun traitement prescrit'}
Notes complémentaires: ${notes || 'Aucune note'}
    `.trim();
    
    // Mettre à jour la consultation
    const updatedConsultation = await client.query(`
      UPDATE Consultation 
      SET diagnostic = $1, compte_rendu = $2, date_modification = NOW()
      WHERE id_cons = $3
      RETURNING *
    `, [diagnostic, compteRenduComplet, consultationId]);
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Consultation mise à jour avec succès',
      consultation: updatedConsultation.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur mise à jour consultation:', error);
    res.status(500).json({ 
      message: error.message || 'Erreur serveur' 
    });
  } finally {
    client.release();
  }
});

// Route pour obtenir toutes les consultations d'un patient
router.get('/consultations/patient/:patientId', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Vérifier que le médecin a accès à ce patient
    const consultations = await pool.query(`
      SELECT c.*, rv.motif as rdv_motif, rv.type as rdv_type
      FROM Consultation c
      LEFT JOIN RendezVous rv ON c.id_r = rv.id_r
      JOIN Medecin m ON c.id_medecin = m.id_m
      WHERE c.id_patient = $1 AND m.id_u = $2
      ORDER BY c.date_c DESC
    `, [patientId, req.user.id]);
    
    res.json({
      consultations: consultations.rows
    });
  } catch (error) {
    console.error('Erreur consultations patient:', error);
    res.status(500).json({ message: 'Erreur serveur' });
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

// 📅 Route MANQUANTE - Rendez-vous par période (pour le calendrier)
router.get('/appointments', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    console.log('📅 Récupération RDV pour:', { start, end, userId: req.user.id });

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Les paramètres start et end sont requis'
      });
    }

    // Récupérer l'ID médecin à partir de l'utilisateur connecté
    const doctorResult = await pool.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const doctorId = doctorResult.rows[0].id_m;

    // Récupérer les rendez-vous avec informations patient
    const appointments = await pool.query(`
      SELECT 
        rv.*,
        u.nom,
        u.prenom,
        u.telephone,
        u.email,
        p.id_p as patient_id
      FROM RendezVous rv
      JOIN Patient p ON rv.id_patient = p.id_p
      JOIN Utilisateur u ON p.id_u = u.id_u
      WHERE rv.id_medecin = $1 
        AND DATE(rv.date_rend) BETWEEN $2 AND $3
      ORDER BY rv.date_rend ASC
    `, [doctorId, start, end]);

    console.log(`✅ Trouvé ${appointments.rows.length} rendez-vous`);

    // Formatter les données pour le frontend
    const formattedAppointments = appointments.rows.map(apt => ({
      id: apt.id_r,
      dateRendezVous: apt.date_rend,
      statut: apt.statut || 'programme',
      typeConsultation: apt.type || 'consultation',
      motif: apt.motif,
      patient: {
        id: apt.patient_id,
        nom: apt.nom,
        prenom: apt.prenom,
        telephone: apt.telephone,
        email: apt.email
      }
    }));

    res.json({
      success: true,
      data: formattedAppointments
    });

  } catch (error) {
    console.error('❌ Erreur récupération rendez-vous:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des rendez-vous',
      error: error.message
    });
  }
});

// 📅 Rendez-vous d'aujourd'hui (route existante améliorée)
router.get('/appointments/today', async (req, res) => {
  try {
    console.log('📅 Récupération RDV aujourd\'hui pour:', req.user.id);

    const doctorResult = await pool.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const doctorId = doctorResult.rows[0].id_m;

    const todayAppointments = await pool.query(`
      SELECT 
        rv.*,
        u.nom,
        u.prenom,
        u.telephone,
        u.email,
        p.id_p as patient_id
      FROM RendezVous rv
      JOIN Patient p ON rv.id_patient = p.id_p
      JOIN Utilisateur u ON p.id_u = u.id_u
      WHERE rv.id_medecin = $1 
        AND DATE(rv.date_rend) = CURRENT_DATE
      ORDER BY rv.date_rend ASC
    `, [doctorId]);

    const formattedAppointments = todayAppointments.rows.map(apt => ({
      id: apt.id_r,
      dateRendezVous: apt.date_rend,
      statut: apt.statut || 'programme',
      typeConsultation: apt.type || 'consultation',
      motif: apt.motif,
      patient: {
        id: apt.patient_id,
        nom: apt.nom,
        prenom: apt.prenom,
        telephone: apt.telephone,
        email: apt.email
      }
    }));

    res.json({
      success: true,
      data: formattedAppointments
    });

  } catch (error) {
    console.error('❌ Erreur RDV aujourd\'hui:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// 📝 Mettre à jour le statut d'un rendez-vous
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;

    console.log('📝 Mise à jour statut RDV:', { appointmentId, status });

    // Vérifier que le RDV appartient au médecin
    const doctorResult = await pool.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const doctorId = doctorResult.rows[0].id_m;

    // Vérifier que le RDV existe et appartient au médecin
    const appointmentCheck = await pool.query(
      'SELECT id_r FROM RendezVous WHERE id_r = $1 AND id_medecin = $2',
      [appointmentId, doctorId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Mettre à jour le statut
    const updateResult = await pool.query(
      'UPDATE RendezVous SET statut = $1 WHERE id_r = $2 RETURNING *',
      [status, appointmentId]
    );

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});
// 📨 Récupérer tous les messages du médecin - VERSION CORRIGÉE
router.get('/messages', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('📨 Récupération messages pour médecin:', req.user.id);

    // Récupérer tous les messages où le médecin est expéditeur ou destinataire
    const messages = await pool.query(`
      SELECT 
        m.*,
        exp.nom as exp_nom, exp.prenom as exp_prenom, exp.role as exp_role, exp.photo as exp_photo,
        dest.nom as dest_nom, dest.prenom as dest_prenom, dest.role as dest_role, dest.photo as dest_photo
      FROM Message m
      JOIN Utilisateur exp ON m.id_expediteur = exp.id_u
      JOIN Utilisateur dest ON m.id_destinataire = dest.id_u
      WHERE m.id_expediteur = $1 OR m.id_destinataire = $1
      ORDER BY m.date_mess DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

    // Compter le total pour la pagination
    const totalCount = await pool.query(`
      SELECT COUNT(*) as total
      FROM Message m
      WHERE m.id_expediteur = $1 OR m.id_destinataire = $1
    `, [req.user.id]);

    // Formatter les données selon la vraie structure de la BDD
    const formattedMessages = messages.rows.map(msg => ({
      id: msg.id_mess,
      contenu: msg.contenu,
      sujet: msg.objet,
      dateEnvoi: msg.date_mess,
      lu: msg.lu,
      expediteur: {
        id: msg.id_expediteur,
        nom: msg.exp_nom,
        prenom: msg.exp_prenom,
        role: msg.exp_role,
        photo: msg.exp_photo
      },
      destinataire: {
        id: msg.id_destinataire,
        nom: msg.dest_nom,
        prenom: msg.dest_prenom,
        role: msg.dest_role,
        photo: msg.dest_photo
      }
    }));

    res.json({
      success: true,
      messages: formattedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].total),
        totalPages: Math.ceil(totalCount.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des messages',
      error: error.message
    });
  }
});

// 💬 Récupérer une conversation spécifique - VERSION CORRIGÉE
router.get('/messages/conversation/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const doctorId = req.user.id;
    
    console.log('💬 Récupération conversation:', { doctorId, userId });

    // Vérifier que l'utilisateur existe
    const userCheck = await pool.query(`
      SELECT id_u, nom, prenom, role, photo FROM Utilisateur WHERE id_u = $1
    `, [userId]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer tous les messages entre le médecin et cet utilisateur
    const messages = await pool.query(`
      SELECT 
        m.*,
        exp.nom as exp_nom, exp.prenom as exp_prenom, exp.role as exp_role,
        dest.nom as dest_nom, dest.prenom as dest_prenom, dest.role as dest_role
      FROM Message m
      JOIN Utilisateur exp ON m.id_expediteur = exp.id_u
      JOIN Utilisateur dest ON m.id_destinataire = dest.id_u
      WHERE 
        (m.id_expediteur = $1 AND m.id_destinataire = $2) OR 
        (m.id_expediteur = $2 AND m.id_destinataire = $1)
      ORDER BY m.date_mess ASC
    `, [doctorId, userId]);

    const formattedMessages = messages.rows.map(msg => ({
      id: msg.id_mess,
      contenu: msg.contenu,
      sujet: msg.objet,
      dateEnvoi: msg.date_mess,
      lu: msg.lu,
      expediteur: {
        id: msg.id_expediteur,
        nom: msg.exp_nom,
        prenom: msg.exp_prenom,
        role: msg.exp_role
      },
      destinataire: {
        id: msg.id_destinataire,
        nom: msg.dest_nom,
        prenom: msg.dest_prenom,
        role: msg.dest_role
      }
    }));

    res.json({
      success: true,
      user: userCheck.rows[0],
      messages: formattedMessages
    });

  } catch (error) {
    console.error('❌ Erreur conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la conversation'
    });
  }
});

// ✉️ Envoyer un message - VERSION CORRIGÉE
router.post('/messages', async (req, res) => {
  try {
    const { destinataireId, contenu, sujet } = req.body;
    const expediteurId = req.user.id;

    console.log('✉️ Envoi message:', { expediteurId, destinataireId, sujet });

    if (!destinataireId || !contenu) {
      return res.status(400).json({
        success: false,
        message: 'Destinataire et contenu requis'
      });
    }

    // Vérifier que le destinataire existe
    const destinataireCheck = await pool.query(`
      SELECT id_u FROM Utilisateur WHERE id_u = $1
    `, [destinataireId]);

    if (destinataireCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Destinataire non trouvé'
      });
    }

    // Insérer le message avec les vrais noms de colonnes
    const newMessage = await pool.query(`
      INSERT INTO Message (id_expediteur, id_destinataire, contenu, objet, date_mess, lu)
      VALUES ($1, $2, $3, $4, NOW(), false)
      RETURNING *
    `, [expediteurId, destinataireId, contenu, sujet || 'Message médical']);

    // Récupérer les infos complètes du message créé
    const messageDetails = await pool.query(`
      SELECT 
        m.*,
        exp.nom as exp_nom, exp.prenom as exp_prenom, exp.role as exp_role,
        dest.nom as dest_nom, dest.prenom as dest_prenom, dest.role as dest_role
      FROM Message m
      JOIN Utilisateur exp ON m.id_expediteur = exp.id_u
      JOIN Utilisateur dest ON m.id_destinataire = dest.id_u
      WHERE m.id_mess = $1
    `, [newMessage.rows[0].id_mess]);

    const msg = messageDetails.rows[0];
    const formattedMessage = {
      id: msg.id_mess,
      contenu: msg.contenu,
      sujet: msg.objet,
      dateEnvoi: msg.date_mess,
      lu: msg.lu,
      expediteur: {
        id: msg.id_expediteur,
        nom: msg.exp_nom,
        prenom: msg.exp_prenom,
        role: msg.exp_role
      },
      destinataire: {
        id: msg.id_destinataire,
        nom: msg.dest_nom,
        prenom: msg.dest_prenom,
        role: msg.dest_role
      }
    };

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: formattedMessage
    });

  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi du message'
    });
  }
});

// 🔧 REQUÊTE POUR DIAGNOSTIQUER VOTRE SCHÉMA DE BDD
router.get('/debug/message-schema', async (req, res) => {
  try {
    // Vérifier la structure de la table Message
    const messageSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'message'
      ORDER BY ordinal_position;
    `);

    // Récupérer quelques messages exemple pour voir les données
    const sampleMessages = await pool.query(`
      SELECT * FROM Message LIMIT 3
    `);

    res.json({
      success: true,
      schema: messageSchema.rows,
      samples: sampleMessages.rows
    });

  } catch (error) {
    console.error('❌ Erreur debug schema:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur debug',
      error: error.message
    });
  }
});
// 🔍 Rechercher des utilisateurs pour nouvelle conversation
router.get('/search/users', async (req, res) => {
  try {
    const { q } = req.query;
    
    console.log('🔍 Recherche utilisateurs pour:', q);
    
    if (!q || q.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await pool.query(`
      SELECT id_u, nom, prenom, role, email, photo
      FROM Utilisateur
      WHERE id_u != $1 
        AND (nom ILIKE $2 OR prenom ILIKE $2 OR email ILIKE $2)
      ORDER BY nom, prenom
      LIMIT 10
    `, [req.user.id, `%${q}%`]);

    console.log(`✅ Trouvé ${users.rows.length} utilisateurs`);

    res.json({
      success: true,
      users: users.rows
    });

  } catch (error) {
    console.error('❌ Erreur recherche utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// 📝 Créer une nouvelle prescription
router.post('/prescriptions', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { patientId, medicaments, diagnostic, compteRendu } = req.body;
    
    console.log('📝 Création prescription:', { patientId, medicaments: medicaments?.length });

    // Vérifications
    if (!patientId || !medicaments || medicaments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient et médicaments requis'
      });
    }

    // Récupérer l'ID médecin
    const doctorResult = await client.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      throw new Error('Médecin non trouvé');
    }

    const doctorId = doctorResult.rows[0].id_m;

    // Créer un rendez-vous temporaire (ou utiliser un existant)
    // Pour simplifier, on crée une consultation directe
    const consultation = await client.query(`
      INSERT INTO Consultation (id_patient, id_medecin, date_c, compte_rendu, diagnostic)
      VALUES ($1, $2, NOW(), $3, $4)
      RETURNING id_cons
    `, [patientId, doctorId, compteRendu || 'Prescription médicale', diagnostic || 'Consultation prescription']);

    const consultationId = consultation.rows[0].id_cons;

    // Ajouter chaque médicament
    const prescriptionIds = [];
    for (const medicament of medicaments) {
      if (!medicament.nom || !medicament.dosage) {
        throw new Error('Nom et dosage requis pour chaque médicament');
      }

      const prescription = await client.query(`
        INSERT INTO Prescription (id_cons, medicament, dose, duree)
        VALUES ($1, $2, $3, $4)
        RETURNING id_presc
      `, [
        consultationId,
        medicament.nom,
        medicament.dosage,
        medicament.duree || '7 jours'
      ]);

      prescriptionIds.push(prescription.rows[0].id_presc);
    }

    await client.query('COMMIT');

    console.log(`✅ Prescription créée avec ${prescriptionIds.length} médicaments`);

    res.status(201).json({
      success: true,
      message: 'Prescription créée avec succès',
      data: {
        consultationId,
        prescriptionIds,
        medicamentsCount: medicaments.length
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur création prescription:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur lors de la création de la prescription'
    });
  } finally {
    client.release();
  }
});
router.get('/prescriptions/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('📋 Récupération prescriptions pour patient:', patientId);

    // Récupérer l'ID médecin
    const doctorResult = await pool.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const doctorId = doctorResult.rows[0].id_m;

    // Récupérer les prescriptions avec consultations - STRUCTURE CORRIGÉE
    const prescriptions = await pool.query(`
      SELECT 
        p.id_presc as id,
        p.medicament,
        p.dose as dosage,
        p.duree,
        c.date_c as "dateCreation",
        c.diagnostic,
        c.compte_rendu,
        c.id_cons as consultation_id
      FROM Prescription p
      JOIN Consultation c ON p.id_cons = c.id_cons
      WHERE c.id_patient = $1 AND c.id_medecin = $2
      ORDER BY c.date_c DESC
    `, [patientId, doctorId]);

    // Grouper les prescriptions par consultation
    const prescriptionsGrouped = {};
    
    prescriptions.rows.forEach(row => {
      const consultationKey = row.consultation_id;
      
      if (!prescriptionsGrouped[consultationKey]) {
        prescriptionsGrouped[consultationKey] = {
          id: row.consultation_id,
          dateCreation: row.dateCreation,
          diagnostic: row.diagnostic,
          medicaments: []
        };
      }
      
      prescriptionsGrouped[consultationKey].medicaments.push({
        id: row.id,
        nom: row.medicament,
        dosage: row.dosage,
        frequence: 'Selon prescription', // Valeur par défaut
        duree: row.duree,
        instructions: 'Suivre les indications médicales' // Valeur par défaut
      });
    });

    const formattedPrescriptions = Object.values(prescriptionsGrouped);

    console.log(`✅ Trouvé ${formattedPrescriptions.length} prescriptions groupées`);

    res.json({
      success: true,
      data: formattedPrescriptions
    });

  } catch (error) {
    console.error('❌ Erreur récupération prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des prescriptions',
      error: error.message
    });
  }
});

// Route corrigée pour la génération PDF - CORRECTION BUFFER BINAIRE
router.get('/prescriptions/:prescriptionId/pdf', async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    console.log('📄 Génération PDF pour consultation:', prescriptionId);
    
    // Validation de l'ID de consultation
    const numericConsultationId = parseInt(prescriptionId);
    if (isNaN(numericConsultationId)) {
      console.error('❌ ID de consultation invalide:', prescriptionId);
      return res.status(400).json({ 
        success: false, 
        message: 'ID de consultation invalide' 
      });
    }

    // Récupérer l'ID médecin
    const doctorResult = await pool.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const doctorId = doctorResult.rows[0].id_m;
    
    // Récupérer les informations de la consultation
    const consultationQuery = `
      SELECT 
        c.id_cons as consultation_id,
        c.diagnostic,
        c.compte_rendu,
        c.date_c as date_creation,
        up.nom as patient_nom,
        up.prenom as patient_prenom,
        up.date_naiss as date_naissance,
        up.telephone,
        ud.nom as doctor_nom,
        ud.prenom as doctor_prenom
      FROM Consultation c
      JOIN Patient p ON c.id_patient = p.id_p
      JOIN Utilisateur up ON p.id_u = up.id_u
      JOIN Medecin m ON c.id_medecin = m.id_m
      JOIN Utilisateur ud ON m.id_u = ud.id_u
      WHERE c.id_cons = $1 AND c.id_medecin = $2
    `;
    
    const consultationResult = await pool.query(consultationQuery, [numericConsultationId, doctorId]);
    
    if (consultationResult.rows.length === 0) {
      console.log('❌ Consultation non trouvée pour ID:', numericConsultationId);
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation non trouvée' 
      });
    }
    
    const consultation = consultationResult.rows[0];
    
    // Récupérer les médicaments
    const medicamentsQuery = `
      SELECT 
        medicament as nom, 
        dose as dosage, 
        duree,
        'Selon prescription' as frequence,
        'Suivre les indications médicales' as instructions
      FROM Prescription
      WHERE id_cons = $1
      ORDER BY id_presc
    `;
    
    const medicamentsResult = await pool.query(medicamentsQuery, [numericConsultationId]);
    
    // Créer le contenu HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Prescription Médicale</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #3498db;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 28px;
        }
        
        .header h2 {
          color: #3498db;
          margin: 5px 0 0 0;
          font-size: 18px;
          font-weight: normal;
        }
        
        .doctor-info, .patient-info {
          background: #f8f9fa;
          padding: 15px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }
        
        .doctor-info h3, .patient-info h3 {
          color: #2c3e50;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        
        .prescription-content {
          margin: 30px 0;
        }
        
        .prescription-content h3 {
          color: #2c3e50;
          border-bottom: 1px solid #bdc3c7;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .medicament {
          background: white;
          border: 1px solid #ecf0f1;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .medicament-name {
          font-weight: bold;
          color: #2c3e50;
          font-size: 18px;
          margin-bottom: 8px;
        }
        
        .medicament-details {
          color: #7f8c8d;
          font-size: 14px;
        }
        
        .medicament-details div {
          margin: 5px 0;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #7f8c8d;
          font-size: 12px;
          border-top: 1px solid #bdc3c7;
          padding-top: 20px;
        }
        
        .signature {
          text-align: right;
          margin-top: 40px;
          padding: 20px;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          width: 200px;
          margin-left: auto;
          margin-top: 30px;
        }
        
        .date {
          text-align: right;
          color: #7f8c8d;
          font-size: 14px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 PRESCRIPTION MÉDICALE</h1>
        <h2>Ordonnance Médicale</h2>
      </div>
      
      <div class="doctor-info">
        <h3>👨‍⚕️ Informations du Médecin</h3>
        <div><strong>Dr. ${consultation.doctor_prenom} ${consultation.doctor_nom}</strong></div>
        <div>Médecin Généraliste</div>
      </div>
      
      <div class="patient-info">
        <h3>👤 Informations du Patient</h3>
        <div><strong>Nom:</strong> ${consultation.patient_prenom} ${consultation.patient_nom}</div>
        <div><strong>Date de naissance:</strong> ${consultation.date_naissance ? new Date(consultation.date_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}</div>
        <div><strong>Téléphone:</strong> ${consultation.telephone || 'Non renseigné'}</div>
      </div>
      
      <div class="date">
        <strong>Date de consultation:</strong> ${new Date(consultation.date_creation).toLocaleDateString('fr-FR')}
      </div>
      
      <div class="prescription-content">
        <h3>💊 Prescription Médicamenteuse</h3>
        
        ${medicamentsResult.rows.length > 0 ? 
          medicamentsResult.rows.map((med, index) => `
            <div class="medicament">
              <div class="medicament-name">
                ${index + 1}. ${med.nom} - ${med.dosage}
              </div>
              <div class="medicament-details">
                <div><strong>🕐 Fréquence:</strong> ${med.frequence}</div>
                <div><strong>📅 Durée:</strong> ${med.duree}</div>
                <div><strong>📝 Instructions:</strong> ${med.instructions}</div>
              </div>
            </div>
          `).join('') 
          : '<div style="color: #e74c3c; text-align: center; padding: 20px;">Aucun médicament prescrit</div>'
        }
      </div>
      
      ${consultation.diagnostic ? `
        <div class="prescription-content">
          <h3>🔍 Diagnostic</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            ${consultation.diagnostic}
          </div>
        </div>
      ` : ''}
      
      ${consultation.compte_rendu ? `
        <div class="prescription-content">
          <h3>📋 Compte Rendu</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            ${consultation.compte_rendu}
          </div>
        </div>
      ` : ''}
      
      <div class="signature">
        <div><strong>Signature du médecin</strong></div>
        <div class="signature-line"></div>
        <div style="margin-top: 10px;">Dr. ${consultation.doctor_prenom} ${consultation.doctor_nom}</div>
      </div>
      
      <div class="footer">
        <div>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
        <div>Cette prescription est valable pour une durée limitée selon la réglementation en vigueur</div>
      </div>
    </body>
    </html>
    `;

    // ✅ CORRECTION CRITIQUE : Configuration Puppeteer et génération PDF
    const puppeteer = require('puppeteer');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true, // ou 'new' selon votre version
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security'
        ]
      });
      
      const page = await browser.newPage();
      
      // ✅ IMPORTANT: Attendre le chargement complet
     await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 0 // désactive le timeout
    });


      
      // ✅ CORRECTION: Générer le PDF en tant que Buffer
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        preferCSSPageSize: true
      });
      
      console.log('✅ PDF généré, taille buffer:', pdfBuffer.length, 'bytes');
      
      // ✅ CORRECTION CRITIQUE: Headers et envoi du buffer binaire
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="prescription_${numericConsultationId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      // ✅ ENVOYER LE BUFFER BINAIRE (pas du texte)
      return res.end(pdfBuffer, 'binary');
      
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    
    // Si les headers ne sont pas encore envoyés, renvoyer une erreur JSON
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la génération du PDF',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});




// À ajouter dans backend/routes/doctor.js

// Route pour récupérer le dossier médical d'un patient
router.get('/medical-records/:patientId', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    console.log('📁 Récupération dossier médical pour patient:', patientId);

    // Récupérer l'ID médecin
    const doctorResult = await pool.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const doctorId = doctorResult.rows[0].id_m;

    // Vérifier que le patient existe et que le médecin y a accès
    const patientAccess = await pool.query(`
      SELECT COUNT(*) as count
      FROM Consultation c
      WHERE c.id_patient = $1 AND c.id_medecin = $2
    `, [patientId, doctorId]);

    if (patientAccess.rows[0].count === '0') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce patient'
      });
    }

    // Récupérer les informations du patient
    const patientInfo = await pool.query(`
      SELECT u.*, p.*
      FROM Utilisateur u
      JOIN Patient p ON u.id_u = p.id_u
      WHERE p.id_p = $1
    `, [patientId]);

    if (patientInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }

    // Récupérer le dossier médical
    const medicalRecord = await pool.query(`
      SELECT dm.*
      FROM DossierMedical dm
      WHERE dm.id_patient = $1
    `, [patientId]);

    // Récupérer les fichiers médicaux
    const medicalFiles = await pool.query(`
      SELECT fm.*
      FROM FichierMedical fm
      WHERE fm.id_d = (SELECT id_d FROM DossierMedical WHERE id_patient = $1)
    `, [patientId]);

    // Construire la réponse
    const response = {
      success: true,
      patient: patientInfo.rows[0],
      allergies: medicalRecord.rows[0]?.allergies || null,
      antecedentsFamiliaux: medicalRecord.rows[0]?.antecedents_familiaux || null,
      antecedentsPersonnels: medicalRecord.rows[0]?.antecedents_personnels || null,
      fichiers: medicalFiles.rows || []
    };

    console.log('✅ Dossier médical récupéré avec succès');

    res.json(response);

  } catch (error) {
    console.error('❌ Erreur récupération dossier médical:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du dossier médical',
      error: error.message
    });
  }
});

// Route pour uploader un fichier médical
router.post('/medical-records/:patientId/files', upload.single('file'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const patientId = req.params.patientId;
    const { description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    console.log('📤 Upload fichier médical:', {
      patientId,
      filename: req.file.filename,
      description
    });

    // Récupérer l'ID médecin
    const doctorResult = await client.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      throw new Error('Médecin non trouvé');
    }

    const doctorId = doctorResult.rows[0].id_m;

    // Vérifier l'accès au patient
    const patientAccess = await client.query(`
      SELECT COUNT(*) as count
      FROM Consultation c
      WHERE c.id_patient = $1 AND c.id_medecin = $2
    `, [patientId, doctorId]);

    if (patientAccess.rows[0].count === '0') {
      throw new Error('Accès non autorisé à ce patient');
    }

    // Récupérer ou créer le dossier médical
    let dossierResult = await client.query(`
      SELECT id_d FROM DossierMedical WHERE id_patient = $1
    `, [patientId]);

    let dossierId;
    if (dossierResult.rows.length === 0) {
      // Créer un nouveau dossier médical
      const newDossier = await client.query(`
        INSERT INTO DossierMedical (id_patient, date_creation)
        VALUES ($1, NOW())
        RETURNING id_d
      `, [patientId]);
      dossierId = newDossier.rows[0].id_d;
    } else {
      dossierId = dossierResult.rows[0].id_d;
    }

    // Insérer le fichier médical
    const fileResult = await client.query(`
      INSERT INTO FichierMedical (id_d, nom, chemin, type_fichier, description, date_upload)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [
      dossierId,
      req.file.originalname,
      req.file.path,
      req.file.mimetype,
      description
    ]);

    await client.query('COMMIT');

    console.log('✅ Fichier médical uploadé avec succès');

    res.status(201).json({
      success: true,
      message: 'Fichier uploadé avec succès',
      file: fileResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    // Supprimer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erreur suppression fichier:', unlinkError);
      }
    }

    console.error('❌ Erreur upload fichier médical:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur lors de l\'upload du fichier'
    });
  } finally {
    client.release();
  }
});

// Route pour supprimer un fichier médical
router.delete('/medical-records/files/:fileId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const fileId = req.params.fileId;

    console.log('🗑️ Suppression fichier médical:', fileId);

    // Récupérer l'ID médecin
    const doctorResult = await client.query(
      'SELECT id_m FROM Medecin WHERE id_u = $1',
      [req.user.id]
    );

    if (doctorResult.rows.length === 0) {
      throw new Error('Médecin non trouvé');
    }

    const doctorId = doctorResult.rows[0].id_m;

    // Récupérer le fichier et vérifier l'accès
    const fileResult = await client.query(`
      SELECT fm.*, dm.id_patient
      FROM FichierMedical fm
      JOIN DossierMedical dm ON fm.id_d = dm.id_d
      WHERE fm.id_fich = $1
    `, [fileId]);

    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    const file = fileResult.rows[0];

    // Vérifier l'accès au patient
    const patientAccess = await client.query(`
      SELECT COUNT(*) as count
      FROM Consultation c
      WHERE c.id_patient = $1 AND c.id_medecin = $2
    `, [file.id_patient, doctorId]);

    if (patientAccess.rows[0].count === '0') {
      throw new Error('Accès non autorisé à ce fichier');
    }

    // Supprimer le fichier de la base de données
    await client.query(`
      DELETE FROM FichierMedical WHERE id_fich = $1
    `, [fileId]);

    // Supprimer le fichier physique
    if (file.chemin && fs.existsSync(file.chemin)) {
      try {
        fs.unlinkSync(file.chemin);
        console.log('✅ Fichier physique supprimé:', file.chemin);
      } catch (fsError) {
        console.error('⚠️ Erreur suppression fichier physique:', fsError);
      }
    }

    await client.query('COMMIT');

    console.log('✅ Fichier médical supprimé avec succès');

    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur suppression fichier médical:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur lors de la suppression du fichier'
    });
  } finally {
    client.release();
  }
});

module.exports = router;