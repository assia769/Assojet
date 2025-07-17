// frontend/src/services/authService.js
import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      console.log('🔐 AuthService: Attempting login for', email);
      
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      
      console.log('🧾 login response DATA content:', response.data);
      
      // Vérifier que la réponse contient les données attendues
      if (!response.data || !response.data.success) {
        throw new Error('Réponse de connexion invalide - pas de succès');
      }
      
      // Les données sont dans response.data.data
      const responseData = response.data.data;
      
      if (!responseData || !responseData.user || !responseData.token) {
        console.error('❌ Structure de réponse invalide:', response.data);
        throw new Error('Réponse de connexion invalide - données manquantes');
      }
      
      const { user, token } = responseData;
      
      // Validation supplémentaire
      if (!user.id || !user.email || !user.role) {
        console.error('❌ Données utilisateur invalides:', user);
        throw new Error('Données utilisateur invalides');
      }
      
      if (!token || typeof token !== 'string') {
        console.error('❌ Token invalide:', token);
        throw new Error('Token invalide');
      }
      
      console.log('✅ AuthService: Login successful');
      console.log('👤 User:', user);
      console.log('🔑 Token length:', token.length);
      
      return { user, token };
    } catch (error) {
      console.error('❌ AuthService: Login failed:', error);
      
      // Gestion des erreurs spécifiques
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (status === 422) {
          throw new Error(data.message || 'Données invalides');
        } else if (status >= 500) {
          throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        }
      }
      
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 AuthService: Attempting registration');
      
      const response = await api.post('/auth/register', userData);
      
      console.log('✅ AuthService: Registration successful');
      
      // Adapter selon la structure de réponse du serveur
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('❌ AuthService: Registration failed:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 409) {
          throw new Error('Un utilisateur avec cet email existe déjà');
        } else if (status === 422) {
          throw new Error(data.message || 'Données invalides');
        }
      }
      
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log('🔓 AuthService: Attempting logout');
      
      // Appel à l'API pour invalider le token côté serveur (optionnel)
      await api.post('/auth/logout');
      
      console.log('✅ AuthService: Logout successful');
    } catch (error) {
      console.error('⚠️ AuthService: Logout error (non-critical):', error);
      // Ne pas lever d'erreur car le logout local peut continuer
    }
  },

  getCurrentUser: async () => {
    try {
      console.log('👤 AuthService: Fetching current user');
      
      const response = await api.get('/auth/me');
      
      console.log('✅ AuthService: Current user fetched');
      
      // Adapter selon la structure de réponse du serveur
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('❌ AuthService: Failed to fetch current user:', error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      console.log('🔄 AuthService: Refreshing token');
      
      const response = await api.post('/auth/refresh');
      
      console.log('✅ AuthService: Token refreshed');
      
      // Adapter selon la structure de réponse du serveur
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('❌ AuthService: Failed to refresh token:', error);
      throw error;
    }
  }
};