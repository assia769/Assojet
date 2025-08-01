// controllers/secretaryController.js
const pool = require('../config/database');

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // RDV aujourd'hui
    const todayAppointmentsResult = await pool.query(
      'SELECT COUNT(*) FROM rendezvous WHERE DATE(date_rend) = $1',
      [today]
    );

    // Factures en attente
    const pendingInvoicesResult = await pool.query(
      'SELECT COUNT(*) FROM facture WHERE statut = $1',
      ['pending']
    );

    // Total patients
    const totalPatientsResult = await pool.query(
      'SELECT COUNT(*) FROM patient' ,
    );

    // Prochains RDV
    const upcomingAppointmentsResult = await pool.query(`
      SELECT r.id_r, r.date_rend, r.heure, r.motif,
             u_p.nom as patient_nom, u_p.prenom as patient_prenom,
             u_m.nom as medecin_nom, u_m.prenom as medecin_prenom
      FROM rendezvous r
      JOIN patient p ON r.id_patient = p.id_p
      JOIN utilisateur u_p ON p.id_u = u_p.id_u
      JOIN medecin m ON r.id_medecin = m.id_m
      JOIN utilisateur u_m ON m.id_u = u_m.id_u
      WHERE r.date_rend >= NOW()
      ORDER BY r.date_rend ASC
      LIMIT 5
    `);
    res.json({
        data: {
          todayAppointments: parseInt(todayAppointmentsResult.rows[0].count),
          pendingInvoices: parseInt(pendingInvoicesResult.rows[0].count),
          totalPatients: parseInt(totalPatientsResult.rows[0].count),
          upcomingAppointments: upcomingAppointmentsResult.rows
        }
});

  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Gestion des RDV
exports.getAppointments = async (req, res) => {
  try {
    const { date, medecinId, status } = req.query;
    console.log('Params reçus:', { date, medecinId, status }); // Ajout de log

    let query = `
      SELECT r.*, 
             u_p.nom as patient_nom, u_p.prenom as patient_prenom, 
             u_p.telephone as patient_telephone, u_p.email as patient_email,
             u_m.nom as medecin_nom, u_m.prenom as medecin_prenom,
             m.specialite
      FROM rendezvous r
      JOIN patient p ON r.id_patient = p.id_p
      JOIN utilisateur u_p ON p.id_u = u_p.id_u
      JOIN medecin m ON r.id_medecin = m.id_m
      JOIN utilisateur u_m ON m.id_u = u_m.id_u
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (date) {
      paramCount++;
      query += ` AND DATE(r.date_rend) = $${paramCount}`;
      params.push(date);
    }

    if (medecinId) {
      paramCount++;
      query += ` AND r.id_medecin = $${paramCount}`;
      params.push(medecinId);
    }

    if (status) {
      paramCount++;
      query += ` AND r.statut = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY r.date_rend ASC';

    console.log('Requête SQL:', query, 'Params:', params); // Ajout de log

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucun rendez-vous trouvé' });
    }

    res.json({data: result.rows});
  } catch (error) {
    console.error('Erreur getAppointments:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    console.log('📝 Données reçues:', req.body);
    
    const { patientId, medecinId, date, heure, motif, type, salle, statut } = req.body;

    // Validation des champs requis
    if (!patientId || !medecinId || !date || !heure || !motif) {
      console.log('❌ Champs manquants');
      return res.status(400).json({ 
        error: 'Tous les champs obligatoires doivent être remplis',
        missing: {
          patientId: !patientId,
          medecinId: !medecinId,
          date: !date,
          heure: !heure,
          motif: !motif
        }
      });
    }

    console.log('🔍 Validation:', {
      patientId: !!patientId,
      medecinId: !!medecinId,
      date: !!date,
      heure: !!heure,
      motif: !!motif
    });

    // Requête d'insertion sans spécifier l'ID (laisse la base générer l'ID automatiquement)
    const query = `
      INSERT INTO rendezvous (id_patient, id_medecin, date_rend, heure, motif, type, salle, statut) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;

    const values = [
      parseInt(patientId),
      parseInt(medecinId),
      date,
      heure,
      motif,
      type || 'consultation',
      salle || '',
      statut || 'confirmé'
    ];

    console.log('🔄 Executing query with values:', values);

    const result = await pool.query(query, values);
    
    console.log('✅ Rendez-vous créé:', result.rows[0]);
    res.status(201).json({
      message: 'Rendez-vous créé avec succès',
      appointment: result.rows[0]
    });

  } catch (error) {
    console.error('Erreur createAppointment:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du rendez-vous',
      details: error.message 
    });
  }
};


exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, heure, motif, statut, salle } = req.body;

    const result = await pool.query(`
      UPDATE rendezvous 
      SET date_rend = $1, heure = $2, motif = $3, statut = $4, salle = $5
      WHERE id_r = $6
      RETURNING *
    `, [date, heure, motif, statut, salle, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateAppointment:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE rendezvous 
      SET statut = 'annulé'
      WHERE id_r = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    res.json({ message: 'Rendez-vous annulé avec succès' });
  } catch (error) {
    console.error('Erreur cancelAppointment:', error);
    res.status(400).json({ message: error.message });
  }
};

// Gestion des patients (accès limité - pas de données médicales sensibles)
exports.getPatients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.nom, u.prenom, u.date_naiss, u.telephone, u.email, u.adresse, p.id_p
      FROM patient p
      JOIN utilisateur u ON p.id_u = u.id_u
      ORDER BY u.nom ASC
    `);
    
    res.json({data: result.rows});
  } catch (error) {
    console.error('Erreur getPatients:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createPatient = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { nom, prenom, email, telephone, adresse, date_naiss, sexe } = req.body;
    
    // Créer d'abord l'utilisateur
    const userResult = await client.query(`
      INSERT INTO utilisateur (nom, prenom, email, telephone, adresse, date_naiss, password, photo, role)
      VALUES ($1, $2, $3, $4, $5, $6, 'temppassword123', 'default.jpg', 'patient')
      RETURNING id_u
    `, [nom, prenom, email, telephone, adresse, date_naiss]);

    // Créer ensuite le patient
    const patientResult = await client.query(`
      INSERT INTO patient (id_u, sexe)
      VALUES ($1, $2)
      RETURNING *
    `, [userResult.rows[0].id_u, sexe]);

    await client.query('COMMIT');
    res.status(201).json({
      ...patientResult.rows[0],
      nom, prenom, email, telephone, adresse, date_naiss
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur createPatient:', error);
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};

exports.updatePatient = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { nom, prenom, telephone, email, adresse } = req.body;

    // Mettre à jour les données utilisateur
    await client.query(`
      UPDATE utilisateur 
      SET nom = $1, prenom = $2, telephone = $3, email = $4, adresse = $5
      FROM patient 
      WHERE utilisateur.id_u = patient.id_u AND patient.id_p = $6
    `, [nom, prenom, telephone, email, adresse, id]);

    await client.query('COMMIT');
    res.json({ message: 'Patient mis à jour avec succès' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur updatePatient:', error);
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};

// Gestion des factures

exports.getInvoices = async (req, res) => {
  try {
    const { status, patientId } = req.query;
    console.log('📋 getInvoices appelé avec:', { status, patientId });
     
    let query = `
      SELECT f.id_f,
             f.date_f,
             f.prix,
             f.statut,
             f.mode_paiement,
             u.nom as patient_nom, 
             u.prenom as patient_prenom,
             c.diagnostic,
             p.id_p
      FROM facture f
      JOIN patient p ON f.id_patient = p.id_p
      JOIN utilisateur u ON p.id_u = u.id_u
      LEFT JOIN consultation c ON f.id_cons = c.id_cons
      WHERE 1=1
    `;
     
    const params = [];
    let paramCount = 0;

    if (status && status !== 'all') {
      paramCount++;
      let dbStatus = status;
      if (status === 'pending') {
        dbStatus = 'unpaid';
      }

      query += ` AND (f.statut::json->>'status') = $${paramCount}`;
      params.push(dbStatus);
    }

    if (patientId) {
      paramCount++;
      query += ` AND f.id_patient = $${paramCount}`;
      params.push(patientId);
    }

    query += ' ORDER BY f.date_f DESC';

    console.log('📊 Exécution requête SQL:', query);
    console.log('📊 Paramètres:', params);

    const result = await pool.query(query, params);
    
    const invoices = result.rows.map(invoice => {
      let parsedStatus = 'pending';
      let parsedPaymentMethod = null;

      try {
        if (invoice.statut) {
          let statusData = invoice.statut;
          
          // Si c'est une string, on la parse
          if (typeof statusData === 'string') {
            statusData = JSON.parse(statusData);
          }
          
          // Fonction récursive pour extraire le statut le plus profond
          const extractDeepestStatus = (obj) => {
            if (obj && typeof obj === 'object') {
              if (obj.status && typeof obj.status === 'object') {
                // Si status est un objet, on va plus profond
                return extractDeepestStatus(obj.status);
              } else if (obj.status) {
                // Si status est une string, on l'utilise
                return {
                  status: obj.status,
                  modePaiement: obj.modePaiement
                };
              }
            }
            return obj;
          };
          
          const deepestStatus = extractDeepestStatus(statusData);
          
          if (deepestStatus) {
            parsedStatus = deepestStatus.status || 'pending';
            parsedPaymentMethod = deepestStatus.modePaiement || statusData.modePaiement || invoice.mode_paiement;
          }
          
          // Conversion unpaid -> pending pour le frontend
          if (parsedStatus === 'unpaid') {
            parsedStatus = 'pending';
          }
        }
      } catch (error) {
        console.warn('Erreur parsing statut pour facture', invoice.id_f, ':', error);
        parsedStatus = 'pending';
        parsedPaymentMethod = invoice.mode_paiement;
      }

      return {
        ...invoice,
        statut: parsedStatus,
        mode_paiement: parsedPaymentMethod
      };
    });
     
    console.log('✅ Factures récupérées et parsées:', invoices.length);
    console.log('📋 Premier élément parsé:', invoices[0]); // Pour debug
    
    // IMPORTANT: Retourner directement le tableau, pas un objet avec data
    res.json(invoices);
       
  } catch (error) {
    console.error('❌ Erreur getInvoices:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des factures',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};
exports.createInvoice = async (req, res) => {
  try {
    const { consultationId, patientId, prix, modePaiement } = req.body;

    // Créer l'objet statut au format JSON
    const statutData = {
      status: 'pending',
      modePaiement: modePaiement || null
    };

    const result = await pool.query(`
      INSERT INTO facture (id_cons, id_patient, date_f, prix, statut, mode_paiement)
      VALUES ($1, $2, CURRENT_DATE, $3, $4, $5)
      RETURNING *
    `, [consultationId, patientId, prix, JSON.stringify(statutData), modePaiement]);

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Erreur createInvoice:', error);
    res.status(400).json({ message: error.message });
  }
};

// Dans secretaryController.js - fonction updateInvoiceStatus modifiée

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, modePaiement } = req.body;

    console.log('🔄 Mise à jour facture:', { id, status, modePaiement });

    if (!id) return res.status(400).json({ message: 'ID de facture manquant' });
    if (!status) return res.status(400).json({ message: 'Statut manquant' });

    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) return res.status(400).json({ message: 'ID de facture invalide' });

    let dbStatus = status === 'pending' ? 'unpaid' : status;

    // Créer un objet JSON simple (pas d'imbrication)
    const statutData = {
      status: dbStatus,
      modePaiement: modePaiement || null
    };

    console.log('📊 Données à insérer:', statutData);

    // Utiliser REPLACE pour éviter l'imbrication
    const result = await pool.query(`
      UPDATE facture 
      SET statut = $1::jsonb, mode_paiement = $2
      WHERE id_f = $3
      RETURNING id_f, id_cons, id_patient, date_f, prix, statut, mode_paiement
    `, [JSON.stringify(statutData), modePaiement || null, invoiceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Facture avec ID ${invoiceId} non trouvée` });
    }

    const updatedInvoice = result.rows[0];

    // Parser le statut retourné
    let statutParsed;
    try {
      statutParsed = typeof updatedInvoice.statut === 'string'
        ? JSON.parse(updatedInvoice.statut)
        : updatedInvoice.statut;
    } catch (error) {
      console.error('Erreur parsing statut retourné:', error);
      statutParsed = { status: 'pending', modePaiement: null };
    }

    let frontendStatus = statutParsed.status === 'unpaid' ? 'pending' : statutParsed.status;

    console.log('✅ Facture mise à jour avec succès:', {
      id: updatedInvoice.id_f,
      statut: frontendStatus,
      mode_paiement: statutParsed.modePaiement
    });

    res.json({
      success: true,
      data: {
        ...updatedInvoice,
        statut: frontendStatus,
        mode_paiement: statutParsed.modePaiement || null
      }
    });

  } catch (error) {
    console.error('❌ Erreur updateInvoiceStatus complète:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });

    res.status(500).json({
      message: 'Erreur lors de la mise à jour de la facture',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        detail: error.detail
      } : 'Erreur interne'
    });
  }
};

// Calendrier
exports.getCalendarView = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await pool.query(`
      SELECT r.id_r, r.date_rend, r.heure, r.motif, r.statut,
             u_p.nom as patient_nom, u_p.prenom as patient_prenom,
             u_m.nom as medecin_nom, u_m.prenom as medecin_prenom,
             m.specialite
      FROM rendezvous r
      JOIN patient p ON r.id_patient = p.id_p
      JOIN utilisateur u_p ON p.id_u = u_p.id_u
      JOIN medecin m ON r.id_medecin = m.id_m
      JOIN utilisateur u_m ON m.id_u = u_m.id_u
      WHERE DATE(r.date_rend) BETWEEN $1 AND $2
      ORDER BY r.date_rend, r.heure
    `, [startDate, endDate]);

    res.json({data: result.rows});
  } catch (error) {
    console.error('Erreur getCalendarView:', error);
    res.status(500).json({ message: error.message });
  }
};

// Envoi de rappels
exports.sendReminders = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const appointments = await pool.query(`
      SELECT r.*, 
             u_p.nom as patient_nom, u_p.prenom as patient_prenom, u_p.email as patient_email,
             u_m.nom as medecin_nom, u_m.prenom as medecin_prenom
      FROM rendezvous r
      JOIN patient p ON r.id_patient = p.id_p
      JOIN utilisateur u_p ON p.id_u = u_p.id_u
      JOIN medecin m ON r.id_medecin = m.id_m
      JOIN utilisateur u_m ON m.id_u = u_m.id_u
      WHERE DATE(r.date_rend) = $1 AND r.statut = 'confirmé'
    `, [tomorrowStr]);

    const reminderResults = [];

    for (const appointment of appointments.rows) {
      try {
        // Ici vous pouvez ajouter la logique d'envoi d'email
        // await sendReminderEmail(appointment);
        reminderResults.push({
          appointmentId: appointment.id_r,
          patient: `${appointment.patient_nom} ${appointment.patient_prenom}`,
          status: 'sent'
        });
      } catch (error) {
        reminderResults.push({
          appointmentId: appointment.id_r,
          patient: `${appointment.patient_nom} ${appointment.patient_prenom}`,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({ reminders: reminderResults });
  } catch (error) {
    console.error('Erreur sendReminders:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir la liste des médecins pour les formulaires
exports.getMedecins = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id_m, u.nom, u.prenom, m.specialite
      FROM medecin m
      JOIN utilisateur u ON m.id_u = u.id_u
      ORDER BY u.nom ASC
    `);
    
    res.json({data:result.rows});
  } catch (error) {
    console.error('Erreur getMedecins:', error);
    res.status(500).json({ message: error.message });
  }
};
