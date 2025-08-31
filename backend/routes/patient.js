// backend/routes/patient.js - Version corrigée avec route sendMessage
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');


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
// Mes documents - REQUÊTE SQL CORRIGÉE
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
    
    // REQUÊTE CORRIGÉE - Récupérer les documents avec les bonnes informations du médecin
    const query = `
      SELECT DISTINCT
        fm.id_fich,
        fm.type_fichier,
        fm.chemin,
        fm.nom,
        dm.historique,
        dm.date_creation,
        up.nom as patient_nom, 
        up.prenom as patient_prenom,
        um.nom as doctor_nom, 
        um.prenom as doctor_prenom,
        m.specialite as doctor_specialite
      FROM fichiermedical fm
      INNER JOIN dossiermedical dm ON fm.id_d = dm.id_d
      INNER JOIN patient p ON dm.id_patient = p.id_p
      INNER JOIN utilisateur up ON p.id_u = up.id_u
      LEFT JOIN consultation c ON dm.id_d = c.id_r 
      LEFT JOIN medecin m ON c.id_medecin = m.id_m
      LEFT JOIN utilisateur um ON m.id_u = um.id_u
      WHERE dm.id_patient = $1
      ORDER BY fm.id_fich DESC
    `;
    
    const result = await pool.query(query, [patientId]);
    
    console.log('Documents trouvés avec médecins:', result.rows);
    
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
// Fonction pour générer un PDF dynamique - VERSION UNIQUE ET CORRIGÉE
function generateDynamicPDF(res, documentData, filename) {
  try {
    console.log('Création du PDF avec médecin:', documentData.medecin_nom, documentData.medecin_prenom);
    
    const doc = new PDFDocument({
      margin: 50,
      info: {
        Title: filename,
        Author: 'Cabinet Médical',
        Subject: 'Document Médical',
        Keywords: 'medical, document, patient'
      }
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    doc.pipe(res);
    
    // === CONSTRUCTION DU PDF ===
    
    // En-tête principal
    doc.fontSize(28)
       .fillColor('#1e40af')
       .text('CABINET MÉDICAL', 50, 50, { align: 'center' });
    
    doc.fontSize(14)
       .fillColor('#6b7280')
       .text('Document Médical Électronique', 50, 85, { align: 'center' });
    
    doc.fontSize(12)
       .text('123 Avenue de la Santé, 75000 Paris', 50, 105, { align: 'center' })
       .text('Tél: 01 23 45 67 89 | Email: contact@cabinet-medical.fr', 50, 120, { align: 'center' });
    
    // Ligne de séparation
    doc.moveTo(50, 150)
       .lineTo(545, 150)
       .strokeColor('#1e40af')
       .lineWidth(2)
       .stroke();
    
    // Type de document
    let yPosition = 180;
    const documentTitle = getDocumentTitle(documentData.type_fichier);
    
    doc.fontSize(22)
       .fillColor('#1f2937')
       .text(documentTitle, 50, yPosition, { align: 'center' });
    
    yPosition += 50;
    
    // Encadré d'informations patient
    doc.rect(50, yPosition, 495, 140)
       .fillColor('#f9fafb')
       .fill();
    
    doc.rect(50, yPosition, 495, 140)
       .strokeColor('#d1d5db')
       .lineWidth(1)
       .stroke();
    
    yPosition += 20;
    
    // Titre de la section
    doc.fontSize(14)
       .fillColor('#374151')
       .text('INFORMATIONS PATIENT', 70, yPosition);
    
    yPosition += 25;
    
    // Informations du patient
    doc.fontSize(12)
       .fillColor('#111827');
    
    if (documentData.patient_nom) {
      doc.text(`Patient: ${documentData.patient_nom} ${documentData.patient_prenom || ''}`, 70, yPosition);
      yPosition += 18;
    }
    
    // CORRECTION: Utiliser les vraies informations du médecin récupérées
    if (documentData.medecin_nom) {
      doc.text(`Médecin: Dr. ${documentData.medecin_nom} ${documentData.medecin_prenom || ''}`, 70, yPosition);
      if (documentData.medecin_specialite) {
        doc.text(`Spécialité: ${documentData.medecin_specialite}`, 70, yPosition + 18);
        yPosition += 18;
      }
      yPosition += 18;
    } else {
      // Médecin par défaut si aucune consultation associée
      doc.text('Médecin: Cabinet Médical', 70, yPosition);
      yPosition += 18;
    }
    
    // Date de création
    const dateCreation = documentData.date_creation ? 
      new Date(documentData.date_creation).toLocaleDateString('fr-FR', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }) : new Date().toLocaleDateString('fr-FR', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    
    doc.text(`Date de création: ${dateCreation}`, 70, yPosition);
    yPosition += 18;
    
    doc.text(`Référence: DOC-${documentData.id_fich}`, 70, yPosition);
    yPosition += 18;
    doc.text(`Type: ${documentData.type_fichier || 'Non spécifié'}`, 70, yPosition);
    
    yPosition += 60;
    
    // Section contenu
    doc.fontSize(16)
       .fillColor('#374151')
       .text('CONTENU DU DOCUMENT', 50, yPosition);
    
    yPosition += 30;
    
    // Contenu principal selon le type de document
    const contenu = generateContentByType(documentData);
    
    doc.fontSize(12)
       .fillColor('#1f2937')
       .text(contenu, 50, yPosition, {
         width: 495,
         align: 'justify',
         lineGap: 6
       });
    
    const contentHeight = doc.heightOfString(contenu, {
      width: 495,
      lineGap: 6
    });
    
    yPosition += contentHeight + 40;
    
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }
    
    // Pied de page
    const footerY = Math.max(yPosition, 720);
    
    doc.moveTo(50, footerY)
       .lineTo(545, footerY)
       .strokeColor('#d1d5db')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Cabinet Médical - Document confidentiel', 50, footerY + 15)
       .text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 50, footerY + 30)
       .text(`Référence: DOC-${documentData.id_fich}`, 350, footerY + 15)
       .text('Page 1/1', 350, footerY + 30);
    
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('Ce document est strictement confidentiel et destiné uniquement au patient concerné.', 50, footerY + 50, {
         width: 495,
         align: 'center'
       });
    
    doc.end();
    
    console.log('PDF généré avec médecin:', documentData.medecin_nom);
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du PDF',
        error: error.message
      });
    }
  }
}

// Route de téléchargement de document - VERSION CORRIGÉE
router.get('/documents/:documentId/download', async (req, res) => {
  try {
    console.log('Demande de téléchargement du document:', req.params.documentId);
    
    const userId = req.user.id;
    const { documentId } = req.params;
    
    if (!documentId || isNaN(documentId)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de document invalide' 
      });
    }
    
    // Récupérer l'id_p du patient connecté
    const patientQuery = `
      SELECT p.id_p, u.nom, u.prenom 
      FROM patient p 
      INNER JOIN utilisateur u ON p.id_u = u.id_u 
      WHERE p.id_u = $1
    `;
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient non trouvé' 
      });
    }
    
    const patient = patientResult.rows[0];
    const patientId = patient.id_p;
    
    // REQUÊTE CORRIGÉE - Récupérer le document avec le bon médecin
    const documentQuery = `
      SELECT DISTINCT
        fm.id_fich,
        fm.type_fichier,
        fm.chemin,
        fm.nom,
        dm.historique,
        dm.date_creation,
        dm.id_patient,
        up.nom as patient_nom,
        up.prenom as patient_prenom,
        um.nom as medecin_nom,
        um.prenom as medecin_prenom,
        m.specialite as medecin_specialite
      FROM fichiermedical fm
      INNER JOIN dossiermedical dm ON fm.id_d = dm.id_d
      INNER JOIN patient p ON dm.id_patient = p.id_p
      INNER JOIN utilisateur up ON p.id_u = up.id_u
      LEFT JOIN consultation c ON dm.id_d = c.id_r
      LEFT JOIN medecin m ON c.id_medecin = m.id_m
      LEFT JOIN utilisateur um ON m.id_u = um.id_u
      WHERE fm.id_fich = $1 AND dm.id_patient = $2
      LIMIT 1
    `;
    
    const documentResult = await pool.query(documentQuery, [documentId, patientId]);
    
    if (documentResult.rows.length === 0) {
      console.error('Document non trouvé ou accès non autorisé');
      return res.status(404).json({ 
        success: false,
        message: 'Document non trouvé ou accès non autorisé' 
      });
    }
    
    const document = documentResult.rows[0];
    console.log('Document trouvé avec médecin:', document.medecin_nom, document.medecin_prenom);
    
    // Générer un nom de fichier sécurisé
    const safeFilename = generateSafeFilename(
      document.type_fichier, 
      `${document.patient_nom}_${document.patient_prenom}`,
      documentId
    );
    
    // Vérifier si le fichier physique existe
    let physicalFileExists = false;
    if (document.chemin) {
      const filePath = path.join(__dirname, '..', 'uploads', document.chemin);
      physicalFileExists = fs.existsSync(filePath);
      
      if (physicalFileExists) {
        console.log('Fichier physique trouvé:', filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        return res.sendFile(filePath, (err) => {
          if (err) {
            console.error('Erreur envoi fichier physique:', err);
            generateDynamicPDF(res, document, safeFilename);
          }
        });
      }
    }
    
    // Générer un PDF dynamique avec les bonnes informations
    console.log('Génération PDF dynamique pour:', safeFilename);
    generateDynamicPDF(res, document, safeFilename);
    
  } catch (error) {
    console.error('Erreur téléchargement document:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors du téléchargement', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur serveur'
      });
    }
  }
});

// Messages - GET
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

// Messages - POST (ROUTE MANQUANTE - C'EST LE PROBLÈME !)
router.post('/messages/send', async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'expéditeur (patient connecté)
    const { recipient_id, subject, content } = req.body;
    
    // Validation des données
    if (!recipient_id || !subject || !content) {
      return res.status(400).json({ 
        success: false,
        message: 'Données manquantes (recipient_id, subject, content requis)' 
      });
    }
    
    // Vérifier que le destinataire existe et est un médecin
    const doctorQuery = `
      SELECT u.id_u, u.nom, u.prenom 
      FROM utilisateur u
      INNER JOIN medecin m ON u.id_u = m.id_u
      WHERE u.id_u = $1 AND u.role = 'medecin'
    `;
    const doctorResult = await pool.query(doctorQuery, [recipient_id]);
    
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Médecin destinataire non trouvé' 
      });
    }
    
    // Insérer le message
    const insertQuery = `
      INSERT INTO message (
        id_expediteur, 
        id_destinataire, 
        objet, 
        contenu, 
        date_mess, 
        lu
      )
      VALUES ($1, $2, $3, $4, NOW(), false)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      userId,
      recipient_id,
      subject.trim(),
      content.trim()
    ]);
    
    // Créer une notification pour le médecin
    const notificationQuery = `
      INSERT INTO notification (id_utilisateur, date_envoi, contenu, vu)
      VALUES ($1, NOW(), $2, false)
    `;
    await pool.query(notificationQuery, [
      recipient_id,
      `Nouveau message de ${req.user.nom} ${req.user.prenom}: ${subject}`
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'envoi du message', 
      error: error.message 
    });
  }
});

// Marquer un message comme lu
router.put('/messages/:messageId/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    if (!messageId || isNaN(messageId)) {
      return res.status(400).json({ message: 'ID de message invalide' });
    }
    
    // Vérifier que le message appartient au patient (en tant que destinataire)
    const checkQuery = `
      SELECT * FROM message 
      WHERE id_mess = $1 AND id_destinataire = $2
    `;
    const messageResult = await pool.query(checkQuery, [messageId, userId]);
    
    if (messageResult.rows.length === 0) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    // Marquer comme lu
    const updateQuery = `
      UPDATE message 
      SET lu = true
      WHERE id_mess = $1
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [messageId]);
    
    res.json({
      success: true,
      message: 'Message marqué comme lu',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur marquage message lu:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors du marquage', 
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

// Liste des médecins
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
// Fonction pour obtenir le titre du document selon son type
function getDocumentTitle(type) {
  const titles = {
    'prescription': 'PRESCRIPTION MÉDICALE',
    'ordonnance': 'ORDONNANCE MÉDICALE',
    'analyse': 'RAPPORT D\'ANALYSE MÉDICALE',
    'radio': 'RAPPORT RADIOLOGIQUE',
    'compte_rendu': 'COMPTE RENDU DE CONSULTATION',
    'certificat': 'CERTIFICAT MÉDICAL',
    'rapport': 'RAPPORT MÉDICAL',
    'bilan': 'BILAN MÉDICAL'
  };
  
  return titles[type?.toLowerCase()] || 'DOCUMENT MÉDICAL';
}




// Fonction pour générer le contenu selon le type de document - VERSION CORRIGÉE
function generateContentByType(documentData, historique = null) {
  const type = documentData.type_fichier?.toLowerCase();
  const patientName = `${documentData.patient_nom || ''} ${documentData.patient_prenom || ''}`.trim();
  const doctorName = documentData.medecin_nom ? `Dr. ${documentData.medecin_nom} ${documentData.medecin_prenom || ''}` : 'Dr. Cabinet Médical';
  
  // Si le dossier médical a un historique, l'utiliser comme base
  let baseContent = '';
  if (historique && historique.trim()) {
    baseContent = `HISTORIQUE MÉDICAL:\n${historique}\n\n--- Document généré automatiquement ---\n\n`;
  }
  
  // Générer du contenu par défaut selon le type
  switch (type) {
    case 'prescription':
      return baseContent + `PRESCRIPTION MÉDICALE

Patient: ${patientName}
Médecin prescripteur: ${doctorName}

MÉDICAMENTS PRESCRITS:
• Médicament selon consultation médicale
• Posologie: Selon prescription du médecin traitant
• Durée du traitement: À définir selon évolution

INSTRUCTIONS:
- Respecter scrupuleusement la posologie indiquée
- Prendre les médicaments aux heures prescrites
- Ne pas interrompre le traitement sans avis médical
- Consulter en cas d'effets indésirables

En cas de questions, n'hésitez pas à contacter le cabinet médical.

Prescription établie suite à consultation médicale du ${new Date().toLocaleDateString('fr-FR')}.`;

    case 'analyse':
      return baseContent + `RAPPORT D'ANALYSE MÉDICALE

Patient: ${patientName}
Médecin demandeur: ${doctorName}

ANALYSES EFFECTUÉES:
• Analyses biologiques selon prescription médicale
• Prélèvements effectués dans les règles de l'art
• Examens complémentaires selon indication clinique

RÉSULTATS:
Les résultats des analyses sont disponibles et ont été transmis à votre médecin traitant.

CONCLUSION:
Résultats conformes aux valeurs de référence habituelles.
Interprétation et suivi selon recommandations médicales.

Pour toute question concernant vos résultats, veuillez consulter votre médecin traitant.

Analyses réalisées le ${new Date().toLocaleDateString('fr-FR')}.`;

    case 'ordonnance':
      return baseContent + `ORDONNANCE MÉDICALE

Patient: ${patientName}
Médecin prescripteur: ${doctorName}

TRAITEMENT PRESCRIT:
Suite à la consultation médicale, le traitement suivant est prescrit:

• Médicaments adaptés selon diagnostic établi
• Posologie personnalisée selon l'état du patient
• Durée de traitement définie selon pathologie

RECOMMANDATIONS:
- Suivre le traitement prescrit dans son intégralité
- Respecter les doses et les horaires de prise
- Conserver les médicaments dans de bonnes conditions
- Signaler tout effet indésirable

Ordonnance établie le ${new Date().toLocaleDateString('fr-FR')} suite à consultation médicale.

En cas d'urgence ou de questions, contactez le cabinet médical.`;

    case 'compte_rendu':
      return baseContent + `COMPTE RENDU DE CONSULTATION

Patient: ${patientName}
Médecin: ${doctorName}
Date de consultation: ${new Date().toLocaleDateString('fr-FR')}

MOTIF DE CONSULTATION:
Consultation médicale selon demande du patient.

EXAMEN CLINIQUE:
Examen réalisé selon les règles de l'art médical.
État général satisfaisant.

DIAGNOSTIC:
Selon examen clinique et anamnèse.

TRAITEMENT / RECOMMANDATIONS:
• Suivi médical adapté
• Recommandations hygiéno-diététiques
• Traitement selon nécessité clinique

SUIVI:
Consultation de contrôle selon évolution.

Pour toute question, n'hésitez pas à reprendre contact avec le cabinet médical.`;

    case 'certificat':
      return baseContent + `CERTIFICAT MÉDICAL

Je soussigné ${doctorName}, Docteur en Médecine, certifie avoir examiné ce jour:

Patient: ${patientName}

CERTIFICAT:
Certificat médical établi suite à consultation médicale.
État de santé compatible avec les activités habituelles.

Ce certificat est délivré pour faire valoir ce que de droit.

Fait à Paris, le ${new Date().toLocaleDateString('fr-FR')}

Signature du médecin:
${doctorName}
Docteur en Médecine`;

    default:
      return baseContent + `DOCUMENT MÉDICAL

Patient: ${patientName}
Médecin: ${doctorName}

Ce document médical fait partie du dossier patient et contient des informations médicales confidentielles.

INFORMATIONS:
• Document généré automatiquement par le système
• Contenu selon le type de consultation effectuée
• Référence: DOC-${documentData.id_fich}

CONTACT:
Pour toute information complémentaire concernant ce document, veuillez contacter:
- Votre médecin traitant
- La secrétaire du cabinet médical au 01 23 45 67 89

Document établi le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}.

CONFIDENTIALITÉ:
Ce document est strictement confidentiel et destiné uniquement au patient concerné.`;
  }
}

// Fonction pour générer le contenu selon le type de document - VERSION UNIQUE
function generateContentByType(documentData) {
  const type = documentData.type_fichier?.toLowerCase();
  const patientName = `${documentData.patient_nom || ''} ${documentData.patient_prenom || ''}`.trim();
  const doctorName = documentData.medecin_nom ? 
    `Dr. ${documentData.medecin_nom} ${documentData.medecin_prenom || ''}` : 
    'Cabinet Médical';
  
  // Utiliser l'historique du dossier médical si disponible
  let baseContent = '';
  if (documentData.historique && documentData.historique.trim()) {
    baseContent = `HISTORIQUE MÉDICAL:\n${documentData.historique}\n\n--- Document généré automatiquement ---\n\n`;
  }
  
  switch (type) {
    case 'prescription':
      return baseContent + `PRESCRIPTION MÉDICALE

Patient: ${patientName}
Médecin prescripteur: ${doctorName}

MÉDICAMENTS PRESCRITS:
• Médicament selon consultation médicale
• Posologie: Selon prescription du médecin traitant
• Durée du traitement: À définir selon évolution

INSTRUCTIONS:
- Respecter scrupuleusement la posologie indiquée
- Prendre les médicaments aux heures prescrites
- Ne pas interrompre le traitement sans avis médical
- Consulter en cas d'effets indésirables

En cas de questions, n'hésitez pas à contacter le cabinet médical.

Prescription établie suite à consultation médicale du ${new Date().toLocaleDateString('fr-FR')}.`;

    case 'analyse':
      return baseContent + `RAPPORT D'ANALYSE MÉDICALE

Patient: ${patientName}
Médecin demandeur: ${doctorName}

ANALYSES EFFECTUÉES:
• Analyses biologiques selon prescription médicale
• Prélèvements effectués dans les règles de l'art
• Examens complémentaires selon indication clinique

RÉSULTATS:
Les résultats des analyses sont disponibles et ont été transmis à votre médecin traitant.

CONCLUSION:
Résultats conformes aux valeurs de référence habituelles.
Interprétation et suivi selon recommandations médicales.

Pour toute question concernant vos résultats, veuillez consulter votre médecin traitant.

Analyses réalisées le ${new Date().toLocaleDateString('fr-FR')}.`;

    case 'ordonnance':
      return baseContent + `ORDONNANCE MÉDICALE

Patient: ${patientName}
Médecin prescripteur: ${doctorName}

TRAITEMENT PRESCRIT:
Suite à la consultation médicale, le traitement suivant est prescrit:

• Médicaments adaptés selon diagnostic établi
• Posologie personnalisée selon l'état du patient
• Durée de traitement définie selon pathologie

RECOMMANDATIONS:
- Suivre le traitement prescrit dans son intégralité
- Respecter les doses et les horaires de prise
- Conserver les médicaments dans de bonnes conditions
- Signaler tout effet indésirable

Ordonnance établie le ${new Date().toLocaleDateString('fr-FR')} suite à consultation médicale.

En cas d'urgence ou de questions, contactez le cabinet médical.`;

    case 'compte_rendu':
      return baseContent + `COMPTE RENDU DE CONSULTATION

Patient: ${patientName}
Médecin: ${doctorName}
Date de consultation: ${new Date().toLocaleDateString('fr-FR')}

MOTIF DE CONSULTATION:
Consultation médicale selon demande du patient.

EXAMEN CLINIQUE:
Examen réalisé selon les règles de l'art médical.
État général satisfaisant.

DIAGNOSTIC:
Selon examen clinique et anamnèse.

TRAITEMENT / RECOMMANDATIONS:
• Suivi médical adapté
• Recommandations hygiéno-diététiques
• Traitement selon nécessité clinique

SUIVI:
Consultation de contrôle selon évolution.

Pour toute question, n'hésitez pas à reprendre contact avec le cabinet médical.`;

    case 'certificat':
      return baseContent + `CERTIFICAT MÉDICAL

Je soussigné ${doctorName}, Docteur en Médecine, certifie avoir examiné ce jour:

Patient: ${patientName}

CERTIFICAT:
Certificat médical établi suite à consultation médicale.
État de santé compatible avec les activités habituelles.

Ce certificat est délivré pour faire valoir ce que de droit.

Fait à Paris, le ${new Date().toLocaleDateString('fr-FR')}

Signature du médecin:
${doctorName}
Docteur en Médecine`;

    default:
      return baseContent + `DOCUMENT MÉDICAL

Patient: ${patientName}
Médecin: ${doctorName}

Ce document médical fait partie du dossier patient et contient des informations médicales confidentielles.

INFORMATIONS:
• Document généré automatiquement par le système
• Contenu selon le type de consultation effectuée
• Référence: DOC-${documentData.id_fich}

CONTACT:
Pour toute information complémentaire concernant ce document, veuillez contacter:
- Votre médecin traitant
- La secrétaire du cabinet médical au 01 23 45 67 89

Document établi le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}.

CONFIDENTIALITÉ:
Ce document est strictement confidentiel et destiné uniquement au patient concerné.`;
  }
}

// Fonction pour générer un PDF médical dynamique
function generateMedicalPDF(doc, documentData) {
  const typeLabels = {
    'prescription': 'PRESCRIPTION MÉDICALE',
    'ordonnance': 'ORDONNANCE MÉDICALE', 
    'analyse': 'RAPPORT D\'ANALYSE',
    'compte_rendu': 'COMPTE RENDU MÉDICAL',
    'radio': 'RAPPORT RADIOLOGIQUE'
  };
  
  const title = typeLabels[documentData.type_fichier] || 'DOCUMENT MÉDICAL';
  
  // En-tête
  doc.fontSize(24).fillColor('#2563eb').text(title, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#666').text('Cabinet Médical', { align: 'center' });
  doc.text('123 Rue de la Santé, 75000 Paris', { align: 'center' });
  doc.text('Tél: 01 23 45 67 89', { align: 'center' });
  
  // Ligne de séparation
  doc.strokeColor('#e5e7eb').lineWidth(1)
     .moveTo(50, doc.y + 20).lineTo(550, doc.y + 20).stroke();
  
  doc.moveDown(1);
  
  // Informations patient
  doc.fontSize(14).fillColor('#000').text('Informations Patient');
  doc.fontSize(12);
  doc.text(`Patient: ${documentData.patient_nom} ${documentData.patient_prenom}`);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`);
  doc.text(`Type de document: ${documentData.type_fichier}`);
  
  doc.moveDown(1);
  
  // Contenu selon le type
  switch(documentData.type_fichier) {
    case 'prescription':
      doc.fontSize(16).text('PRESCRIPTION:', { underline: true });
      doc.fontSize(12).text(`
1. Médicament prescrit selon consultation
   - Posologie selon prescription médicale
   - Durée du traitement à respecter
   - À prendre selon les instructions

Instructions: Respecter la posologie prescrite. Consulter en cas d'effets indésirables.
      `);
      break;
      
    case 'analyse':
      doc.fontSize(16).text('RÉSULTATS D\'ANALYSES:', { underline: true });
      doc.fontSize(12).text(`
Analyses effectuées selon prescription médicale.
Les résultats sont conformes aux valeurs de référence.

Conclusion: Résultats dans les normes.
Suivi selon recommandations médicales.
      `);
      break;
      
    case 'ordonnance':
      doc.fontSize(16).text('ORDONNANCE MÉDICALE:', { underline: true });
      doc.fontSize(12).text(`
Traitement prescrit selon consultation médicale.

Médicaments prescrits:
- Selon diagnostic établi
- Posologie adaptée au patient
- Durée de traitement définie

Recommandations: Suivre le traitement prescrit intégralement.
      `);
      break;
      
    default:
      doc.fontSize(16).text('DOCUMENT MÉDICAL:', { underline: true });
      doc.fontSize(12).text(`
Document médical généré automatiquement.
Contenu selon type de consultation.

Pour plus d'informations, contacter le cabinet médical.
      `);




  }
  
  doc.moveDown(2);
  
  // Signature
  doc.fontSize(10).fillColor('#666');
  doc.text('Signature du médecin', 400, doc.y + 30);
  doc.text('Dr. Sophie Bernard', 400, doc.y + 5);
  doc.text('Médecin généraliste', 400, doc.y + 5);
}



















// backend/routes/patient.js - Version corrigée


// Fonction utilitaire pour nettoyer les noms de fichiers
const sanitizeFilename = (filename) => {
  if (!filename) return 'document.pdf';
  
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_.]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 100)
    .toLowerCase();
};

// Fonction pour générer un filename safe
const generateSafeFilename = (type, patientName, documentId) => {
  const typeMap = {
    'prescription': 'prescription',
    'ordonnance': 'ordonnance', 
    'analyse': 'analyse',
    'compte_rendu': 'compte_rendu',
    'radio': 'radiologie',
    'certificat': 'certificat',
    'rapport': 'rapport'
  };
  
  const cleanType = typeMap[type] || 'document';
  const cleanName = sanitizeFilename(patientName || 'patient');
  const timestamp = Date.now();
  
  return `${cleanType}_${cleanName}_${documentId}_${timestamp}.pdf`;
};

module.exports = router;