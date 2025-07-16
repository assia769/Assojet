// frontend/src/services/authService.js
import api from './api';

export const authService = {
  async login(email, password, twoFactorCode = null) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        twoFactorCode
      });
     console.log('🧾 login response DATA content:', response.data.data);

      const { token, user } = response.data.data;
      
      // Stocker le token et l'utilisateur
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      console.error('Auth service login error:', error);
      
      // Gestion améliorée des erreurs
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Si c'est une erreur de validation avec des détails
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(errorData.errors.join(', '));
        }
        
        // Si c'est une erreur générale
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      
      // Erreur par défaut
      throw new Error('Erreur lors de la connexion');
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data.data;
    } catch (error) {
      console.error('Auth service register error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(errorData.errors.join(', '));
        }
        
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      
      throw new Error('Erreur lors de l\'inscription');
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data.user;
    } catch (error) {
      console.error('Auth service profile error:', error);
      throw error.response?.data || new Error('Erreur lors de la récupération du profil');
    }
  },

  async generateTwoFactorQR(email) {
    try {
      const response = await api.post('/auth/generate-2fa', { email });
      return response.data.data;
    } catch (error) {
      console.error('Auth service 2FA error:', error);
      throw error.response?.data || new Error('Erreur lors de la génération du QR code');
    }
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Récupérer l'utilisateur depuis le localStorage
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};