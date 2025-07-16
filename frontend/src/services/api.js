// frontend/src/services/api.js
import axios from 'axios';

// Configuration de base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🔐 Request with token:', !!token);
    console.log('🔗 Request URL:', config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url);
    
    // Si le token est expiré ou invalide
    if (error.response?.status === 401) {
      console.log('🔑 Token expired or invalid, redirecting to login');
      // Supprimer le token invalide
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de connexion
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;