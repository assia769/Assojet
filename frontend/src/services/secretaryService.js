// frontend/src/services/secretaryService.js
import api from './api';

export const secretaryService = {
  // Dashboard stats
  async getDashboardStats() {
    const response = await api.get('/secretary/dashboard/stats');
    return response.data.data;
  },

  // Gestion des rendez-vous
  async getAppointments(params = {}) {
    const response = await api.get('/secretary/appointments', { params });
    return response.data.data;
  },

  async createAppointment(appointmentData) {
    const response = await api.post('/secretary/appointments', appointmentData);
    return response.data.data;
  },

  async updateAppointment(id, appointmentData) {
    const response = await api.put(`/secretary/appointments/${id}`, appointmentData);
    return response.data.data;
  },

  async cancelAppointment(id) {
    const response = await api.delete(`/secretary/appointments/${id}`);
    return response.data;
  },

  // Gestion des patients
  async getPatients(params = {}) {
    const response = await api.get('/secretary/patients', { params });
    return response.data.data;
  },

  async createPatient(patientData) {
    const response = await api.post('/secretary/patients', patientData);
    return response.data.data;
  },

  async updatePatient(id, patientData) {
    const response = await api.put(`/secretary/patients/${id}`, patientData);
    return response.data.data;
  },

  // Gestion des factures
  async getInvoices(params = {}) {
    const response = await api.get('/secretary/invoices', { params });
    return response.data.data;
  },

  async createInvoice(invoiceData) {
    const response = await api.post('/secretary/invoices', invoiceData);
    return response.data.data;
  },

  async updateInvoiceStatus(id, status) {
    const response = await api.put(`/secretary/invoices/${id}/status`, { status });
    return response.data.data;
  },

  // Calendrier
  async getCalendarView(params = {}) {
    const response = await api.get('/secretary/calendar', { params });
    return response.data.data;
  },

  // Liste des médecins
  async getMedecins() {
    const response = await api.get('/secretary/medecins');
    return response.data.data;
  },

  // Envoi de rappels
  async sendReminders(reminderData) {
    try {
      const response = await api.post('/secretary/send-reminders', reminderData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi des rappels:', error);
      throw error;
    }
  }
};