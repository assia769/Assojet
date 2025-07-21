// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// Créer et EXPORTER le contexte
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Charger les données d'authentification au démarrage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        console.log('🔄 Initializing auth...');
        console.log('📝 Stored token:', storedToken ? 'exists' : 'none');
        console.log('👤 Stored user:', storedUser ? 'exists' : 'none');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          console.log('✅ Auth restored from localStorage');
        } else {
          console.log('⚠️ No stored auth data found');
        }
      } catch (error) {
        console.error('❌ Error loading auth data:', error);
        // Nettoyer les données corrompues
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login...');
      
      const response = await authService.login(email, password);
      console.log('🧾 Login response:', response);
      
      if (response.user && response.token) {
        // Stocker le token ET les données utilisateur
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Mettre à jour le state
        setToken(response.token);
        setUser(response.user);
        
        console.log('✅ Login successful, token stored');
        console.log('🔑 Token preview:', response.token.substring(0, 20) + '...');
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Nettoyer en cas d'erreur
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  


// Remplacer la méthode register dans votre AuthContext.js

const register = async (userData) => {
  try {
    setLoading(true);
    console.log('📝 Attempting registration...');
    
    // Nettoyer le token existant avant l'inscription
    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      console.log('🧹 Clearing existing token before registration');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
    
    const response = await authService.register(userData);
    console.log('🧾 Register response:', response);
    
    // Ne pas stocker le token - juste retourner le succès
    if (response.user) {
      console.log('✅ Registration successful - user not logged in automatically');
      
      // Retourner seulement les infos d'inscription sans connexion automatique
      return { 
        success: true, 
        user: response.user,
        message: 'Inscription réussie. Veuillez vous connecter.'
      };
    } else {
      throw new Error('Réponse d\'inscription invalide');
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // S'assurer que rien n'est stocké en cas d'erreur
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    throw error;
  } finally {
    setLoading(false);
  }
};
  const logout = () => {
    console.log('🔓 Logging out...');
    
    // Nettoyer localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Nettoyer le state
    setToken(null);
    setUser(null);
    
    console.log('✅ Logout completed');
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isMedecin = () => {
    return user?.role === 'medecin';
  };

  const isPatient = () => {
    return user?.role === 'patient';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isMedecin,
    isPatient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};