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

// Documents - Télécharger un document (VERSION CORRIGÉE)
  async downloadDocument(documentId) {
    try {
      console.log('🔄 Téléchargement du document:', documentId);
      
      if (!documentId) {
        throw new Error('ID du document manquant');
      }

      // Configuration pour recevoir un blob (fichier binaire)
      const response = await api.get(`/patient/documents/${documentId}/download`, {
        responseType: 'blob', // ✅ Important pour recevoir le PDF en binaire
        timeout: 60000, // Timeout de 60 secondes pour la génération PDF
        headers: {
          'Accept': 'application/pdf'
        }
      });

      console.log('✅ Réponse reçue');
      console.log('📦 Type de contenu:', response.headers['content-type']);
      console.log('📦 Taille du fichier:', response.headers['content-length'], 'bytes');

      // Vérifier que c'est bien un PDF
      if (!response.headers['content-type']?.includes('application/pdf')) {
        console.warn('⚠️ Type MIME inattendu:', response.headers['content-type']);
      }

      // Extraire le nom de fichier du header Content-Disposition
      let filename = `document_medical_${documentId}.pdf`;
      const disposition = response.headers['content-disposition'];
      
      if (disposition) {
        console.log('📋 Content-Disposition:', disposition);
        
        // Plusieurs patterns pour extraire le filename
        const patterns = [
          /filename\*?=['"]?([^'"\s]+)['"]?/i,
          /filename=['"]([^'"]+)['"]/i,
          /filename=([^;\s]+)/i
        ];
        
        for (const pattern of patterns) {
          const match = disposition.match(pattern);
          if (match && match[1]) {
            filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
            break;
          }
        }
      }

      console.log('📄 Nom de fichier final:', filename);

      // Vérifier que nous avons bien reçu des données
      if (!response.data || response.data.size === 0) {
        throw new Error('Aucune donnée reçue du serveur');
      }

      // Créer un blob à partir de la réponse
      const blob = new Blob([response.data], { 
        type: 'application/pdf' 
      });

      console.log('📦 Blob créé, taille:', blob.size, 'bytes');

      // Créer une URL temporaire pour le téléchargement
      const url = window.URL.createObjectURL(blob);

      // Créer un lien de téléchargement et le déclencher
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Utiliser download au lieu de setAttribute
      link.style.display = 'none';
      
      // Ajouter au DOM, cliquer, puis supprimer
      document.body.appendChild(link);
      
      // Déclencher le téléchargement
      link.click();
      
      // Nettoyer immédiatement
      document.body.removeChild(link);

      // Nettoyer l'URL temporaire après un délai
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        console.log('🧹 URL temporaire nettoyée');
      }, 2000);

      console.log('✅ Téléchargement initié avec succès pour:', filename);
      
      return {
        success: true,
        filename: filename,
        size: blob.size,
        type: 'application/pdf'
      };

    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      
      // Messages d'erreur plus précis selon le type d'erreur
      let errorMessage = 'Erreur lors du téléchargement du document';
      
      if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
        errorMessage = 'Le téléchargement a pris trop de temps. Le document est peut-être volumineux, veuillez réessayer.';
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur de réseau. Vérifiez votre connexion internet.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Demande invalide. Vérifiez l\'ID du document.';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Accès non autorisé à ce document.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Document non trouvé.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur du serveur lors de la génération du document.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
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