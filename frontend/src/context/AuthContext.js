// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier si un token existe
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            // Optionnellement, vérifier la validité du token avec le serveur
            // const profile = await authService.getProfile();
            // setUser(profile);
          } catch (error) {
            console.error('Error parsing saved user:', error);
            // Nettoyer les données corrompues
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // En cas d'erreur, nettoyer le localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, twoFactorCode = null) => {
    try {
      const { token, user: userData } = await authService.login(email, password, twoFactorCode);
      setUser(userData);
      return { token, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Même en cas d'erreur, nettoyer l'état local
      setUser(null);
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('authToken');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isMedecin = () => {
    return user && user.role === 'medecin';
  };

  const isPatient = () => {
    return user && user.role === 'patient';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated,
    isAdmin,
    isMedecin,
    isPatient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext };
