// frontend/src/services/doctorService.js
import api from './api';

class DoctorService {
  // Dashboard
  async getDashboardStats() {
    try {
      const response = await api.get('/doctor/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Gestion des patients
  async getPatientsList(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/doctor/patients?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPatientDetails(patientId) {
    try {
      const response = await api.get(`/doctor/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePatientInfo(patientId, patientData) {
    try {
      const response = await api.put(`/doctor/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Consultations
  async createConsultation(consultationData) {
    try {
      const response = await api.post('/doctor/consultations', consultationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getConsultation(appointmentId) {
    try {
      const response = await api.get(`/doctor/consultations/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateConsultation(consultationId, consultationData) {
    try {
      const response = await api.put(`/doctor/consultations/${consultationId}`, consultationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getConsultationsByPatient(patientId) {
    try {
      const response = await api.get(`/doctor/consultations/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Dossiers médicaux
  async getMedicalRecord(patientId) {
    try {
      const response = await api.get(`/doctor/medical-records/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateMedicalRecord(patientId, recordData) {
    try {
      const response = await api.put(`/doctor/medical-records/${patientId}`, recordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadMedicalFile(patientId, formData) {
    try {
      const response = await api.post(`/doctor/medical-records/${patientId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteMedicalFile(fileId) {
    try {
      const response = await api.delete(`/doctor/medical-files/${fileId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Calendrier et rendez-vous
  async getAppointments(startDate, endDate) {
  try {
    console.log(`📅 Récupération RDV: ${startDate} -> ${endDate}`);
    
    const response = await api.get(`/doctor/appointments?start=${startDate}&end=${endDate}`);
    
    console.log('✅ RDV reçus:', response.data);
    
    // Gérer les deux formats de réponse possibles
    if (response.data.success) {
      return response.data.data; // Nouveau format avec success: true
    } else {
      return response.data; // Format direct (si pas d'enveloppement)
    }
  } catch (error) {
    console.error('❌ Erreur récupération RDV:', error);
    throw error;
  }
}

  async getTodayAppointments() {
    try {
      const response = await api.get('/doctor/appointments/today');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId, status) {
    try {
      const response = await api.patch(`/doctor/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Ordonnances et prescriptions
  async createPrescription(consultationId, prescriptionData) {
    try {
      const response = await api.post(`/doctor/consultations/${consultationId}/prescriptions`, prescriptionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPrescriptions(patientId) {
    try {
      const response = await api.get(`/doctor/prescriptions/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async generatePrescriptionPDF(prescriptionId) {
    try {
      const response = await api.get(`/doctor/prescriptions/${prescriptionId}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createOrdonnance(consultationId, ordonnanceData) {
    try {
      const response = await api.post(`/doctor/consultations/${consultationId}/ordonnances`, ordonnanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Examens
  async createExam(consultationId, examData) {
    try {
      const response = await api.post(`/doctor/consultations/${consultationId}/exams`, examData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateExamResults(examId, results) {
    try {
      const response = await api.patch(`/doctor/exams/${examId}/results`, { resultat: results });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadExamFile(examId, formData) {
    try {
      const response = await api.post(`/doctor/exams/${examId}/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  
 

  // Statistiques
  async getStatistics(period = 'month') {
    try {
      const response = await api.get(`/doctor/statistics?period=${period}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getConsultationsStats(startDate, endDate) {
    try {
      const response = await api.get(`/doctor/statistics/consultations?start=${startDate}&end=${endDate}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPathologiesStats() {
    try {
      const response = await api.get('/doctor/statistics/pathologies');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPatientsStats() {
    try {
      const response = await api.get('/doctor/statistics/patients');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Profil médecin
  async getProfile() {
    try {
      const response = await api.get('/doctor/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/doctor/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateAvailability(availabilityData) {
    try {
      const response = await api.put('/doctor/availability', availabilityData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadSignature(formData) {
    try {
      const response = await api.post('/doctor/signature', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Notifications
  async getNotifications() {
    try {
      const response = await api.get('/doctor/notifications');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.patch(`/doctor/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Recherche
  async searchPatients(query) {
    try {
      const response = await api.get(`/doctor/search/patients?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rapports
  async generateConsultationReport(consultationId) {
    try {
      const response = await api.get(`/doctor/reports/consultation/${consultationId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async generatePatientReport(patientId, options = {}) {
    try {
      const params = new URLSearchParams(options);
      const response = await api.get(`/doctor/reports/patient/${patientId}?${params}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
// Messagerie - version corrigée
async getMessages(page = 1, limit = 20) {
  try {
    console.log('📨 Récupération messages...');
    const response = await api.get(`/doctor/messages?page=${page}&limit=${limit}`);
    console.log('✅ Messages reçus:', response.data);
    
    if (response.data.success) {
      return response.data;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    throw error;
  }
}

async sendMessage(messageData) {
  try {
    console.log('✉️ Envoi message:', messageData);
    const response = await api.post('/doctor/messages', messageData);
    console.log('✅ Message envoyé:', response.data);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    throw error;
  }
}

async markMessageAsRead(messageId) {
  try {
    console.log('✅ Marquage message lu:', messageId);
    const response = await api.patch(`/doctor/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur marquage lu:', error);
    throw error;
  }
}

async getConversation(userId) {
  try {
    console.log('💬 Récupération conversation avec:', userId);
    const response = await api.get(`/doctor/messages/conversation/${userId}`);
    console.log('✅ Conversation reçue:', response.data);
    
    if (response.data.success) {
      return response.data;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('❌ Erreur récupération conversation:', error);
    throw error;
  }
}

async searchUsers(query) {
  try {
    const response = await api.get(`/doctor/search/users?q=${encodeURIComponent(query)}`);
    if (response.data.success) {
      return response.data.users;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('❌ Erreur recherche utilisateurs:', error);
    throw error;
  }
}
}

export default new DoctorService();