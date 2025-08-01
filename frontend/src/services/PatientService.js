// frontend/src/services/patientService.js
import api from './api';

class PatientService {
  
  // Dashboard - Récupérer les statistiques du patient
  async getDashboardStats() {
    try {
      const response = await api.get('/patient/dashboard');
      console.log('Dashboard stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Rendez-vous - Réserver un nouveau RDV
  async bookAppointment(appointmentData) {
    try {
      const response = await api.post('/patient/appointments/book', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la réservation du RDV:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la réservation');
    }
  }

  // Rendez-vous - Récupérer mes RDV avec paramètres optionnels
  async getMyAppointments(params = {}) {
    try {
      // Construction de l'URL avec les paramètres de requête
      let url = '/patient/appointments';
      const queryParams = new URLSearchParams();
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await api.get(url);
      console.log('Appointments response:', response.data);
      
      // ✅ Gérer la nouvelle structure de réponse
      if (response.data && typeof response.data === 'object') {
        // Si la réponse a une propriété 'data', l'utiliser
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Si la réponse a une propriété 'success' et 'data'
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        // Si c'est directement un tableau
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Fallback : retourner un tableau vide
      console.warn('Format de réponse inattendu pour les appointments:', response.data);
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des RDV:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des RDV');
    }
  }

  // Rendez-vous - Annuler un RDV
  async cancelAppointment(appointmentId, reason) {
    try {
      const response = await api.put(`/patient/appointments/${appointmentId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du RDV:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  }

  // Créneaux - Récupérer les créneaux disponibles
  async getAvailableSlots(date) {
    try {
      const response = await api.get(`/patient/available-slots?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des créneaux');
    }
  }

  // Documents - Récupérer mes documents
  async getMyDocuments() {
    try {
      const response = await api.get('/patient/documents');
      
      // ✅ Gérer la nouvelle structure de réponse
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des documents');
    }
  }

  // Documents - Télécharger un document
  async downloadDocument(documentId) {
    try {
      const response = await api.get(`/patient/documents/${documentId}/download`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement');
    }
  }

  // Messages - Récupérer mes messages
  async getMyMessages() {
    try {
      const response = await api.get('/patient/messages');
      
      // ✅ Gérer la nouvelle structure de réponse
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des messages');
    }
  }

  // Messages - Envoyer un message
  async sendMessage(messageData) {
    try {
      const response = await api.post('/patient/messages/send', messageData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  }

  // Messages - Marquer comme lu
  async markMessageAsRead(messageId) {
    try {
      const response = await api.put(`/patient/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage du message:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du marquage');
    }
  }

  // Notifications - Récupérer mes notifications
  async getMyNotifications() {
    try {
      const response = await api.get('/patient/notifications');
      
      // ✅ Gérer la nouvelle structure de réponse
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications');
    }
  }

  // Notifications - Marquer comme lue
  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.put(`/patient/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du marquage');
    }
  }

  // Utilitaires pour le formatage des dates
  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  formatTime(timeString) {
    return timeString;
  }

  formatDateTime(dateString) {
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }
  // Médecins - Récupérer la liste des médecins disponibles
async getDoctors() {
  try {
    const response = await api.get('/patient/doctors');
    
    // ✅ Gérer la nouvelle structure de réponse
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des médecins');
  }
}
}


export default new PatientService();