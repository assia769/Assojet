// backend/routes/patient.js - Version corrigée pour votre DB
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

// Middleware pour vérifier l'authentification et le rôle patient
router.use(protect);
router.use(authorize('patient'));

// Dashboard - Statistiques patient
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id; // id de l'utilisateur connecté
    
    // D'abord récupérer l'id_p du patient à partir de l'id_u
    const patientQuery = `
      SELECT id_p FROM patient WHERE id_u = $1
    `;
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    const patientId = patientResult.rows[0].id_p;
    
    // Prochains RDV (statut confirmé ou en attente)
    const upcomingQuery = `
      SELECT COUNT(*) as count
      FROM rendezvous 
      WHERE id_patient = $1 
        AND date_rend >= CURRENT_DATE 
        AND (statut = 'confirmé' OR statut = 'en_attente' OR statut IS NULL)
    `;
    const upcoming = await pool.query(upcomingQuery, [patientId]);
    
    // Documents disponibles dans le dossier médical
    const documentsQuery = `
      SELECT COUNT(fm.*) as count
      FROM dossiermedical dm
      LEFT JOIN fichiermedical fm ON dm.id_d = fm.id_d
      WHERE dm.id_patient = $1
    `;
    const documents = await pool.query(documentsQuery, [patientId]);
    
    // Messages non lus (où le patient est destinataire)
    const messagesQuery = `
      SELECT COUNT(*) as count
      FROM message 
      WHERE id_destinataire = $1 AND lu = false
    `;
    const messages = await pool.query(messagesQuery, [userId]);
    
    // Notifications non lues
    const notificationsQuery = `
      SELECT COUNT(*) as count
      FROM notification 
      WHERE id_utilisateur = $1 AND vu = false
    `;
    const notifications = await pool.query(notificationsQuery, [userId]);
    
    res.json({
      success: true,
      upcomingAppointments: parseInt(upcoming.rows[0].count) || 0,
      totalDocuments: parseInt(documents.rows[0].count) || 0,
      unreadMessages: parseInt(messages.rows[0].count) || 0,
      unreadNotifications: parseInt(notifications.rows[0].count) || 0
    });
  } catch (error) {
    console.error('Erreur dashboard patient:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
});

// Réserver un RDV
router.post('/appointments/book', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date_rend, heure, type, motif, id_medecin, salle } = req.body;
    
    // Validation des données
    if (!date_rend || !heure || !type || !motif) {
      return res.status(400).json({ message: 'Données manquantes' });
    }
    
    // Récupérer l'id_p du patient
    const patientQuery = `SELECT id_p FROM patient WHERE id_u = $1`;
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    const patientId = patientResult.rows[0].id_p;
    
    // Construire la date complète
    const dateTime = `${date_rend} ${heure}`;
    
    // Vérifier la disponibilité
    const availabilityQuery = `
      SELECT id_r FROM rendezvous 
      WHERE date_rend = $1 AND heure = $2 
        AND (statut != 'annulé' OR statut IS NULL)
        AND ($3::INTEGER IS NULL OR id_medecin = $3)
    `;
    const existingAppointment = await pool.query(availabilityQuery, [
      dateTime, heure, id_medecin || null
    ]);
    
    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({ message: 'Ce créneau n\'est pas disponible' });
    }
    
    const insertQuery = `
      INSERT INTO rendezvous (
        id_patient, id_medecin, date_rend, type, motif, salle, heure, 
        statut, is_an_emergency
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'en_attente', false)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      patientId, 
      id_medecin || null, 
      dateTime, 
      type, 
      motif, 
      salle || 'Salle 1', 
      heure
    ]);
    
    // Créer une notification pour les secrétaires
    const notificationQuery = `
      INSERT INTO notification (id_utilisateur, date_envoi, contenu, vu)
      SELECT u.id_u, NOW(), $1, false
      FROM utilisateur u 
      WHERE u.role = 'secretaire'
    `;
    await pool.query(notificationQuery, [
      `Nouvelle demande de RDV de ${req.user.nom} ${req.user.prenom} pour le ${date_rend}`
    ]);
    
    res.status(201).json({
      success: true,
      message: 'RDV réservé avec succès',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur réservation RDV:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la réservation', 
      error: error.message 
    });
  }
});

// Mes RDV
router.get('/appointments', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit } = req.query;
    
    // Récupérer l'id_p du patient
    const patientQuery = `SELECT id_p FROM patient WHERE id_u = $1`;
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    const patientId = patientResult.rows[0].id_p;
    
    let query = `
      SELECT 
        r.*,
        r.date_rend as date_rdv,
        r.heure as heure_rdv,
        r.type as type_consultation,
        r.motif as notes,
        r.statut as status,
        um.nom as doctor_nom, 
        um.prenom as doctor_prenom
      FROM rendezvous r
      LEFT JOIN medecin m ON r.id_medecin = m.id_m
      LEFT JOIN utilisateur um ON m.id_u = um.id_u
      WHERE r.id_patient = $1
      ORDER BY r.date_rend DESC, r.heure DESC
    `;
    
    const params = [patientId];
    
    if (limit && !isNaN(limit)) {
      query += ` LIMIT $2`;
      params.push(parseInt(limit));
    }
    
    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Erreur récupération RDV:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
});

// Annuler un RDV
router.put('/appointments/:appointmentId/cancel', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;
    
    if (!appointmentId || isNaN(appointmentId)) {
      return res.status(400).json({ message: 'ID de RDV invalide' });
    }
    
    // Récupérer l'id_p du patient
    const patientQuery = `SELECT id_p FROM patient WHERE id_u = $1`;
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    const patientId = patientResult.rows[0].id_p;
    
    // Vérifier que le RDV appartient au patient
    const checkQuery = `
      SELECT * FROM rendezvous 
      WHERE id_r = $1 AND id_patient = $2
    `;
    const appointment = await pool.query(checkQuery, [appointmentId, patientId]);
    
    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'RDV non trouvé' });
    }
    
    if (appointment.rows[0].statut === 'annulé') {
      return res.status(400).json({ message: 'RDV déjà annulé' });
    }
    
    // Annuler le RDV
    const updateQuery = `
      UPDATE rendezvous 
      SET statut = 'annulé'
      WHERE id_r = $1
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [appointmentId]);
    
    // Notifier les secrétaires
    const notificationQuery = `
      INSERT INTO notification (id_utilisateur, date_envoi, contenu, vu)
      SELECT u.id_u, NOW(), $1, false
      FROM utilisateur u 
      WHERE u.role = 'secretaire'
    `;
    await pool.query(notificationQuery, [
      `RDV annulé par ${req.user.nom} ${req.user.prenom} - ${new Date(appointment.rows[0].date_rend).toLocaleDateString()} - Raison: ${reason || 'Non spécifiée'}`
    ]);
    
    res.json({
      success: true,
      message: 'RDV annulé avec succès',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur annulation RDV:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'annulation', 
      error: error.message 
    });
  }
});

// Mes documents
router.get('/documents', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer l'id_p du patient
    const patientQuery = `SELECT id_p FROM patient WHERE id_u = $1`;
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    const patientId = patientResult.rows[0].id_p;
    
    const query = `
      SELECT 
        fm.*,
        dm.historique,
        um.nom as doctor_nom, 
        um.prenom as doctor_prenom
      FROM dossiermedical dm
      LEFT JOIN fichiermedical fm ON dm.id_d = fm.id_d
      LEFT JOIN consultation c ON dm.id_patient = c.id_patient
      LEFT JOIN medecin m ON c.id_medecin = m.id_m
      LEFT JOIN utilisateur um ON m.id_u = um.id_u
      WHERE dm.id_patient = $1
      ORDER BY fm.id_fich DESC
    `;
    
    const result = await pool.query(query, [patientId]);
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Erreur récupération documents:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
});

// Messages
router.get('/messages', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        m.*,
        m.date_mess as created_at,
        m.contenu as content,
        m.objet as subject,
        m.lu as read_by_patient,
        ue.nom as sender_nom, 
        ue.prenom as sender_prenom,
        ud.nom as recipient_nom, 
        ud.prenom as recipient_prenom,
        CASE 
          WHEN m.id_expediteur = $1 THEN 'sent'
          ELSE 'received'
        END as message_type
      FROM message m
      LEFT JOIN utilisateur ue ON m.id_expediteur = ue.id_u
      LEFT JOIN utilisateur ud ON m.id_destinataire = ud.id_u
      WHERE m.id_expediteur = $1 OR m.id_destinataire = $1
      ORDER BY m.date_mess DESC
    `;
    
    const result = await pool.query(query, [userId]);
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
});

// Notifications
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        *,
        date_envoi as created_at,
        contenu as message,
        vu as is_read
      FROM notification 
      WHERE id_utilisateur = $1
      ORDER BY date_envoi DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query, [userId]);
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
});

// Créneaux disponibles
router.get('/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date requise' });
    }
    
    // Créneaux standards
    const standardSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];
    
    // Récupérer les créneaux pris
    const takenSlotsQuery = `
      SELECT heure FROM rendezvous 
      WHERE DATE(date_rend) = $1 
        AND (statut != 'annulé' OR statut IS NULL)
    `;
    const takenSlots = await pool.query(takenSlotsQuery, [date]);
    const takenTimes = takenSlots.rows.map(row => row.heure);
    
    const availableSlots = standardSlots.filter(slot => !takenTimes.includes(slot));
    
    res.json({
      success: true,
      date: date,
      availableSlots: availableSlots,
      totalSlots: standardSlots.length,
      availableCount: availableSlots.length
    });
  } catch (error) {
    console.error('Erreur créneaux disponibles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
});
router.get('/doctors', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id_u as id,
        u.nom,
        u.prenom,
        u.email,
        u.telephone as phone,
        m.specialite
      FROM utilisateur u
      INNER JOIN medecin m ON u.id_u = m.id_u
      WHERE u.role = 'medecin' 
      ORDER BY u.nom, u.prenom
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Erreur récupération médecins:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
});
module.exports = router;