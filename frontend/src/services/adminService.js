// frontend/src/services/adminService.js
import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/settings/dashboard/stats');
    return response.data.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/settings/users', { params });
    return response.data.data;
  },

  async createUser(userData) {
    const response = await api.post('/admin/settings/users', userData);
    return response.data.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/admin/settings/users/${id}`, userData);
    return response.data.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/admin/settings/users/${id}`);
    return response.data;
  },

 
 async generateUserReport(userId) {
  try {
    const response = await api.get('/admin/settings/reports', {
      params: { userId }
      // Pas besoin de répéter le header Authorization car api.js s'en charge déjà
    });
    return response.data;
  } catch (error) {
    console.error('Erreur service generateUserReport:', error);
    throw error;
  }
},
  async getSystemSettings() {
  try {
    const response = await api.get('/admin/settings/settings');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    throw error;
  }
},

async updateSystemSettings(settings) {
  try {
    const response = await api.put('/admin/settings/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    throw error;
  }
},

async initializeSystemSettings() {
  try {
    const response = await api.post('/admin/settings/settings/init');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des paramètres:', error);
    throw error;
  }
},
};