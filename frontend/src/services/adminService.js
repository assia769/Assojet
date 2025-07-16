// frontend/src/services/adminService.js
import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  async generateReport(params) {
    const response = await api.get('/admin/reports', { params });
    return response.data.data;
  }
};