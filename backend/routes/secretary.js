// routes/secretary.js
const express = require('express');
const router = express.Router();
const secretaryController = require('../controllers/secretaryController');
const {
  protect,
  requireSecretaryOrAdmin
} = require('../middleware/auth');

// ✅ Middleware de protection et d'autorisation (secrétaire ou admin)
router.use(protect);
router.use(requireSecretaryOrAdmin);

// 📊 Dashboard - Statistiques
router.get('/dashboard/stats', secretaryController.getDashboardStats);

// 📅 Gestion des rendez-vous
router.get('/appointments', secretaryController.getAppointments);
router.post('/appointments', secretaryController.createAppointment);
router.put('/appointments/:id', secretaryController.updateAppointment);
router.delete('/appointments/:id', secretaryController.cancelAppointment);

// 🧑‍⚕️ Gestion des patients
router.get('/patients', secretaryController.getPatients);
router.post('/patients', secretaryController.createPatient);
router.put('/patients/:id', secretaryController.updatePatient);

// 💸 Gestion des factures
router.get('/invoices', secretaryController.getInvoices);
router.post('/invoices', secretaryController.createInvoice);
router.put('/invoices/:id/status', secretaryController.updateInvoiceStatus);

// 🔔 Envoi de rappels
router.post('/send-reminders', secretaryController.sendReminders);

// 📆 Vue calendrier
router.get('/calendar', secretaryController.getCalendarView);

// 👨‍⚕️ Liste des médecins
router.get('/medecins', secretaryController.getMedecins);

module.exports = router;
