// routes/secretary.js
const express = require('express');
const router = express.Router();
const secretaryController = require('../controllers/secretaryController');
const { protect, authorize } = require('../middleware/auth');


// Toutes les routes nécessitent l'authentification et le rôle secrétaire
router.use(protect);
router.use(authorize('secretaire', 'admin'));

// Dashboard
router.get('/dashboard/stats', secretaryController.getDashboardStats);

// Gestion des RDV
router.get('/appointments', secretaryController.getAppointments);
router.post('/appointments', secretaryController.createAppointment);
router.put('/appointments/:id', secretaryController.updateAppointment);
router.delete('/appointments/:id', secretaryController.cancelAppointment);

// Gestion des patients (accès limité)
router.get('/patients', secretaryController.getPatients);
router.post('/patients', secretaryController.createPatient);
router.put('/patients/:id', secretaryController.updatePatient);

// Gestion des factures
router.get('/invoices', secretaryController.getInvoices);
router.post('/invoices', secretaryController.createInvoice);
router.put('/invoices/:id/status', secretaryController.updateInvoiceStatus);

// Envoi de rappels
router.post('/send-reminders', secretaryController.sendReminders);

// Calendrier (vue générale)
router.get('/calendar', secretaryController.getCalendarView);

// Liste des médecins
router.get('/medecins', secretaryController.getMedecins);

module.exports = router;
