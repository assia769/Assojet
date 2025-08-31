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

  // ========================
  // GESTION DES PATIENTS
  // ========================

  async getPatientsList(filters = {}) {
    try {
      console.log('🔍 Récupération liste patients:', filters);
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/doctor/patients?${params}`);
      
      if (response.data.patients) {
        return {
          patients: response.data.patients,
          pagination: response.data.pagination || {}
        };
      } else {
        return { patients: [], pagination: {} };
      }
    } catch (error) {
      console.error('❌ Erreur getPatientsList:', error);
      throw error;
    }
  }

  async getPatientDetails(patientId) {
    try {
      console.log('🔍 Récupération détails patient:', patientId);
      const response = await api.get(`/doctor/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getPatientDetails:', error);
      throw error;
    }
  }

  async updatePatientInfo(patientId, patientData) {
    try {
      console.log('✏️ Mise à jour patient:', patientId, patientData);
      const response = await api.put(`/doctor/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updatePatientInfo:', error);
      throw error;
    }
  }

  // ========================
  // DOSSIERS MÉDICAUX
  // ========================

  async getMedicalRecord(patientId) {
    try {
      console.log('🔍 Récupération dossier médical pour patient:', patientId);
      
      const response = await api.get(`/doctor/medical-records/${patientId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Erreur récupération dossier');
      }
    } catch (error) {
      console.error('❌ Erreur getMedicalRecord:', error);
      throw error;
    }
  }

  async updateMedicalRecord(patientId, recordData) {
    try {
      console.log('✏️ Mise à jour dossier médical:', patientId, recordData);
      const response = await api.put(`/doctor/medical-records/${patientId}`, recordData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateMedicalRecord:', error);
      throw error;
    }
  }

  async uploadMedicalFile(patientId, formData) {
    try {
      console.log('📤 Upload fichier médical pour patient:', patientId);
      
      const response = await api.post(`/doctor/medical-records/${patientId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Erreur upload fichier');
      }
    } catch (error) {
      console.error('❌ Erreur uploadMedicalFile:', error);
      throw error;
    }
  }

  async deleteMedicalFile(fileId) {
    try {
      console.log('🗑️ Suppression fichier médical:', fileId);
      
      const response = await api.delete(`/doctor/medical-records/files/${fileId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Erreur suppression fichier');
      }
    } catch (error) {
      console.error('❌ Erreur deleteMedicalFile:', error);
      throw error;
    }
  }

  // ========================
  // CONSULTATIONS
  // ========================

  async createConsultation(consultationData) {
    try {
      console.log('📝 Création consultation:', consultationData);
      const response = await api.post('/doctor/consultations', consultationData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création consultation:', error);
      throw error;
    }
  }

  async getConsultation(appointmentId) {
    try {
      console.log('🔍 Récupération consultation:', appointmentId);
      const response = await api.get(`/doctor/consultations/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getConsultation:', error);
      throw error;
    }
  }

  async updateConsultation(consultationId, consultationData) {
    try {
      console.log('✏️ Mise à jour consultation:', consultationId, consultationData);
      const response = await api.put(`/doctor/consultations/${consultationId}`, consultationData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateConsultation:', error);
      throw error;
    }
  }

  async getConsultationsByPatient(patientId) {
    try {
      console.log('🔍 Récupération consultations pour patient:', patientId);
      
      const response = await api.get(`/doctor/consultations/patient/${patientId}`);
      
      if (response.data.consultations) {
        return response.data.consultations;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur getConsultationsByPatient:', error);
      return [];
    }
  }

  // ========================
  // PRESCRIPTIONS
  // ========================

  async getPrescriptions(patientId) {
    try {
      console.log('🔍 Récupération prescriptions pour patient:', patientId);
      
      const response = await api.get(`/doctor/prescriptions/patient/${patientId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur getPrescriptions:', error);
      return [];
    }
  }

  async createPrescription(prescriptionData) {
    try {
      console.log('📝 Création prescription:', prescriptionData);
      const response = await api.post('/doctor/prescriptions', prescriptionData);
      console.log('✅ Prescription créée:', response.data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('❌ Erreur création prescription:', error);
      throw error;
    }
  }

  async generatePrescriptionPDF(prescriptionId) {
    try {
      console.log('📄 Génération PDF pour prescription:', prescriptionId);
      
      // Validation et conversion de l'ID
      if (!prescriptionId || prescriptionId === 'undefined') {
        throw new Error('ID de prescription manquant');
      }
      
      const numericId = parseInt(prescriptionId);
      if (isNaN(numericId)) {
        throw new Error(`ID de prescription invalide: ${prescriptionId}`);
      }
      
      // Appel API avec l'ID numérique correct
      const response = await api.get(`/doctor/prescriptions/${numericId}/pdf`, {
        responseType: 'blob',
        timeout: 30000, // 30 secondes
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      console.log('✅ PDF généré avec succès, taille:', response.data.size);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur génération PDF service:', {
        prescriptionId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Messages d'erreur plus précis
      if (error.response?.status === 404) {
        throw new Error('Prescription non trouvée');
      } else if (error.response?.status === 500) {
        throw new Error('Erreur serveur lors de la génération PDF');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout - La génération PDF a pris trop de temps');
      }
      
      throw error;
    }
  }

  async createOrdonnance(consultationId, ordonnanceData) {
    try {
      console.log('📝 Création ordonnance:', consultationId, ordonnanceData);
      const response = await api.post(`/doctor/consultations/${consultationId}/ordonnances`, ordonnanceData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur createOrdonnance:', error);
      throw error;
    }
  }

  // ========================
  // EXAMENS
  // ========================

  async createExam(consultationId, examData) {
    try {
      console.log('📝 Création examen:', consultationId, examData);
      const response = await api.post(`/doctor/consultations/${consultationId}/exams`, examData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur createExam:', error);
      throw error;
    }
  }

  async updateExamResults(examId, results) {
    try {
      console.log('✏️ Mise à jour résultats examen:', examId, results);
      const response = await api.patch(`/doctor/exams/${examId}/results`, { resultat: results });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateExamResults:', error);
      throw error;
    }
  }

  async uploadExamFile(examId, formData) {
    try {
      console.log('📤 Upload fichier examen:', examId);
      const response = await api.post(`/doctor/exams/${examId}/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur uploadExamFile:', error);
      throw error;
    }
  }

  // ========================
  // CALENDRIER ET RENDEZ-VOUS
  // ========================

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
      console.log('📅 Récupération RDV du jour');
      const response = await api.get('/doctor/appointments/today');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getTodayAppointments:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId, status) {
    try {
      console.log('✏️ Mise à jour statut RDV:', appointmentId, status);
      const response = await api.patch(`/doctor/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateAppointmentStatus:', error);
      throw error;
    }
  }

  // ========================
  // STATISTIQUES
  // ========================

  async getStatistics(period = 'month') {
    try {
      console.log('📊 Récupération statistiques:', period);
      const response = await api.get(`/doctor/statistics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getStatistics:', error);
      throw error;
    }
  }

  async getConsultationsStats(startDate, endDate) {
    try {
      console.log('📊 Récupération stats consultations:', { startDate, endDate });
      const response = await api.get(`/doctor/statistics/consultations?start=${startDate}&end=${endDate}`);
      console.log('✅ Stats consultations reçues:', response.data);
      
      // Si pas de données, générer des données simulées en mode dev
      if (!response.data || response.data.length === 0) {
        console.log('⚠️ Aucune consultation trouvée, génération de données simulées');
        
        if (process.env.NODE_ENV === 'development') {
          return this.generateSimulatedConsultationsData(startDate, endDate);
        }
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération stats consultations:', error);
      
      // En cas d'erreur, retourner des données simulées en dev
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Génération de données simulées suite à l\'erreur');
        return this.generateSimulatedConsultationsData(startDate, endDate);
      }
      
      throw error;
    }
  }

  generateSimulatedConsultationsData(startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Générer des données pour chaque jour entre start et end
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      
      // Plus de consultations en semaine (1-5), moins le weekend
      let baseCount = 0;
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        baseCount = Math.floor(Math.random() * 6) + 2; // 2-8 consultations
      } else {
        baseCount = Math.floor(Math.random() * 3); // 0-2 consultations le weekend
      }
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        count: baseCount
      });
      
      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log('📊 Données simulées générées:', data);
    return data;
  }

  generateSimulatedPathologies() {
    const pathologies = [
      { nom: 'Hypertension', count: Math.floor(Math.random() * 15) + 5 },
      { nom: 'Diabète', count: Math.floor(Math.random() * 12) + 3 },
      { nom: 'Grippe', count: Math.floor(Math.random() * 20) + 8 },
      { nom: 'Migraine', count: Math.floor(Math.random() * 10) + 4 },
      { nom: 'Asthme', count: Math.floor(Math.random() * 8) + 2 },
      { nom: 'Arthrose', count: Math.floor(Math.random() * 6) + 1 },
      { nom: 'Dépression', count: Math.floor(Math.random() * 7) + 2 }
    ];
    
    console.log('📊 Pathologies simulées générées:', pathologies);
    return pathologies;
  }

  async getPathologiesStats() {
    try {
      console.log('📊 Récupération stats pathologies');
      const response = await api.get('/doctor/statistics/pathologies');
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const validData = response.data
          .filter(item => item && item.nom && typeof item.count === 'number')
          .map(item => ({
            nom: item.nom.toString().trim(),
            count: parseInt(item.count) || 0
          }))
          .filter(item => item.count > 0);

        if (validData.length > 0) {
          return validData;
        }
      }
      
      // Fallback vers données simulées
      return this.generateSimulatedPathologies();
      
    } catch (error) {
      console.error('❌ Erreur getPathologiesStats:', error);
      return this.generateSimulatedPathologies();
    }
  }

  async getPatientsStats() {
    try {
      console.log('📊 Récupération stats patients');
      const response = await api.get('/doctor/statistics/patients');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getPatientsStats:', error);
      throw error;
    }
  }

  async loadAllStatistics(selectedPeriod, dateRange) {
    try {
      // Récupération statistiques principales
      const statsData = await this.getStatistics(selectedPeriod).catch(() => ({}));

      // Récupération consultations avec fallback
      let consultationsData = [];
      try {
        consultationsData = await this.getConsultationsStats(dateRange.start, dateRange.end);
        if (!consultationsData || consultationsData.length === 0) {
          consultationsData = this.generateSimulatedConsultationsData(dateRange.start, dateRange.end);
        }
      } catch (error) {
        consultationsData = this.generateSimulatedConsultationsData(dateRange.start, dateRange.end);
      }

      // Récupération pathologies avec fallback
      let pathologiesData = [];
      try {
        pathologiesData = await this.getPathologiesStats();
        if (!pathologiesData || !Array.isArray(pathologiesData) || pathologiesData.length === 0) {
          throw new Error('Pathologies vides');
        }
        pathologiesData = pathologiesData
          .filter(item => item && item.nom && typeof item.count === 'number')
          .map(item => ({
            nom: item.nom.toString().trim(),
            count: parseInt(item.count) || 0
          }))
          .filter(item => item.count > 0);

        if (pathologiesData.length === 0) {
          throw new Error('Aucune pathologie valide');
        }
      } catch (error) {
        pathologiesData = this.generateSimulatedPathologies();
      }

      // Récupération statistiques patients
      const patientsData = await this.getPatientsStats().catch(() => ({}));

      // Retour des données
      return {
        stats: statsData,
        consultations: consultationsData,
        pathologies: pathologiesData,
        patients: patientsData,
      };
    } catch (error) {
      console.error('❌ Erreur loadAllStatistics:', error);
      return {
        stats: {},
        consultations: this.generateSimulatedConsultationsData(dateRange.start, dateRange.end),
        pathologies: this.generateSimulatedPathologies(),
        patients: {},
      };
    }
  }

  // ========================
  // PROFIL MÉDECIN
  // ========================

  async getProfile() {
    try {
      console.log('👤 Récupération profil médecin');
      const response = await api.get('/doctor/profile');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProfile:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      console.log('✏️ Mise à jour profil médecin:', profileData);
      const response = await api.put('/doctor/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateProfile:', error);
      throw error;
    }
  }

  async updateAvailability(availabilityData) {
    try {
      console.log('✏️ Mise à jour disponibilités:', availabilityData);
      const response = await api.put('/doctor/availability', availabilityData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateAvailability:', error);
      throw error;
    }
  }

  async uploadSignature(formData) {
    try {
      console.log('📤 Upload signature');
      const response = await api.post('/doctor/signature', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur uploadSignature:', error);
      throw error;
    }
  }

  // ========================
  // MESSAGERIE
  // ========================

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
      console.log('🔍 Recherche utilisateurs:', query);
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

  // ========================
  // NOTIFICATIONS
  // ========================

  async getNotifications() {
    try {
      console.log('🔔 Récupération notifications');
      const response = await api.get('/doctor/notifications');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getNotifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      console.log('✅ Marquage notification lue:', notificationId);
      const response = await api.patch(`/doctor/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur markNotificationAsRead:', error);
      throw error;
    }
  }

  // ========================
  // RECHERCHE
  // ========================

  async searchPatients(query) {
    try {
      console.log('🔍 Recherche patients:', query);
      const response = await api.get(`/doctor/search/patients?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur searchPatients:', error);
      throw error;
    }
  }

  // ========================
  // RAPPORTS
  // ========================

  async generateConsultationReport(consultationId) {
    try {
      console.log('📄 Génération rapport consultation:', consultationId);
      const response = await api.get(`/doctor/reports/consultation/${consultationId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur generateConsultationReport:', error);
      throw error;
    }
  }

  async generatePatientReport(patientId, options = {}) {
    try {
      console.log('📄 Génération rapport patient:', patientId, options);
      const params = new URLSearchParams(options);
      const response = await api.get(`/doctor/reports/patient/${patientId}?${params}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur generatePatientReport:', error);
      throw error;
    }
  }
}

export default new DoctorService();