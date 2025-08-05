// // frontend/src/context/AuthContext.js
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { authService } from '../services/authService';

// // Créer et EXPORTER le contexte
// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(null);

//   // Charger les données d'authentification au démarrage
//   useEffect(() => {
//     const initAuth = () => {
//       try {
//         const storedToken = localStorage.getItem('authToken');
//         const storedUser = localStorage.getItem('user');
        
//         console.log('🔄 Initializing auth...');
//         console.log('📝 Stored token:', storedToken ? 'exists' : 'none');
//         console.log('👤 Stored user:', storedUser ? 'exists' : 'none');
        
//         if (storedToken && storedUser) {
//           const userData = JSON.parse(storedUser);
//           setToken(storedToken);
//           setUser(userData);
//           console.log('✅ Auth restored from localStorage');
//         } else {
//           console.log('⚠️ No stored auth data found');
//         }
//       } catch (error) {
//         console.error('❌ Error loading auth data:', error);
//         // Nettoyer les données corrompues
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('user');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initAuth();
//   }, []);

//   const login = async (email, password) => {
//     try {
//       setLoading(true);
//       console.log('🔐 Attempting login...');
      
//       const response = await authService.login(email, password);
//       console.log('🧾 Login response:', response);
      
//       if (response.user && response.token) {
//         // Stocker le token ET les données utilisateur
//         localStorage.setItem('authToken', response.token);
//         localStorage.setItem('user', JSON.stringify(response.user));
        
//         // Mettre à jour le state
//         setToken(response.token);
//         setUser(response.user);
        
//         console.log('✅ Login successful, token stored');
//         console.log('🔑 Token preview:', response.token.substring(0, 20) + '...');
        
//         return { success: true, user: response.user };
//       } else {
//         throw new Error('Réponse de connexion invalide');
//       }
//     } catch (error) {
//       console.error('❌ Login error:', error);
      
//       // Nettoyer en cas d'erreur
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('user');
//       setToken(null);
//       setUser(null);
      
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };
  


// // Remplacer la méthode register dans votre AuthContext.js

// const register = async (userData) => {
//   try {
//     setLoading(true);
//     console.log('📝 Attempting registration...');
    
//     // Nettoyer le token existant avant l'inscription
//     const existingToken = localStorage.getItem('authToken');
//     if (existingToken) {
//       console.log('🧹 Clearing existing token before registration');
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('user');
//       setToken(null);
//       setUser(null);
//     }
    
//     const response = await authService.register(userData);
//     console.log('🧾 Register response:', response);
    
//     // Ne pas stocker le token - juste retourner le succès
//     if (response.user) {
//       console.log('✅ Registration successful - user not logged in automatically');
      
//       // Retourner seulement les infos d'inscription sans connexion automatique
//       return { 
//         success: true, 
//         user: response.user,
//         message: 'Inscription réussie. Veuillez vous connecter.'
//       };
//     } else {
//       throw new Error('Réponse d\'inscription invalide');
//     }
//   } catch (error) {
//     console.error('❌ Registration error:', error);
    
//     // S'assurer que rien n'est stocké en cas d'erreur
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('user');
//     setToken(null);
//     setUser(null);
    
//     throw error;
//   } finally {
//     setLoading(false);
//   }
// };
//   const logout = () => {
//     console.log('🔓 Logging out...');
    
//     // Nettoyer localStorage
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('user');
    
//     // Nettoyer le state
//     setToken(null);
//     setUser(null);
    
//     console.log('✅ Logout completed');
//   };

//   const isAuthenticated = () => {
//     return !!(user && token);
//   };

//   const isAdmin = () => {
//     return user?.role === 'admin';
//   };

//   const isMedecin = () => {
//     return user?.role === 'medecin';
//   };

//   const isPatient = () => {
//     return user?.role === 'patient';
//   };

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     register,
//     logout,
//     isAuthenticated,
//     isAdmin,
//     isMedecin,
//     isPatient,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Créer et EXPORTER le contexte
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configuration de l'URL de base de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialiser l'état depuis localStorage au montage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('✅ Auth initialized from localStorage');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Nettoyer si les données sont corrompues
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Enregistrement classique
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
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('🧾 Register response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur d\'inscription');
      }
      
      // Ne pas stocker le token - juste retourner le succès
      if (data.user) {
        console.log('✅ Registration successful - user not logged in automatically');
        
        return { 
          success: true, 
          user: data.user,
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

  // Login classique
  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Starting login process');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      console.log('✅ AuthContext: Login response received', data);

      // Si 2FA requis, retourner les infos sans mettre à jour l'état
      if (data.requires2FA) {
        console.log('🔐 AuthContext: 2FA required');
        return data;
      }

      // Connexion normale - stocker les données
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);

      console.log('✅ AuthContext: Login successful');
      return data;

    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      throw error;
    }
  };

  // Vérification 2FA
  const verify2FA = async (tempToken, code, isSetup = false) => {
    try {
      console.log('🔐 AuthContext: Starting 2FA verification');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken, code, isSetup }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Code 2FA invalide');
      }

      // Stocker les données après vérification 2FA réussie
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);

      console.log('✅ AuthContext: 2FA verification successful');
      return data;

    } catch (error) {
      console.error('❌ AuthContext: 2FA verification failed:', error);
      throw error;
    }
  };

  // Génération du QR Code 2FA
  const generate2FA = async (email) => {
    try {
      console.log('🔐 AuthContext: Generating 2FA QR Code');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/generate-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur génération QR Code');
      }

      console.log('✅ AuthContext: QR Code generated');
      return data;

    } catch (error) {
      console.error('❌ AuthContext: QR Code generation failed:', error);
      throw error;
    }
  };

  // Désactiver 2FA
  const disable2FA = async (password) => {
    try {
      console.log('🔐 AuthContext: Disabling 2FA');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/disable-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur désactivation 2FA');
      }

      // Mettre à jour l'utilisateur local
      const updatedUser = { ...user, twofa_enabled: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      console.log('✅ AuthContext: 2FA disabled');
      return data;

    } catch (error) {
      console.error('❌ AuthContext: 2FA disable failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    console.log('🚪 AuthContext: Logging out');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    
    console.log('✅ Logout completed');
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = () => {
    return !!(token && user);
  };

  // Méthodes de vérification de rôles
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isMedecin = () => {
    return user?.role === 'medecin';
  };

  const isPatient = () => {
    return user?.role === 'patient';
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Vérifier si l'utilisateur a l'un des rôles spécifiés
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Obtenir les en-têtes d'autorisation
  const getAuthHeaders = () => {
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Faire une requête authentifiée
  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    };

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Si token expiré ou invalide
    if (response.status === 401) {
      console.warn('⚠️ Token expired or invalid, logging out');
      logout();
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    return response;
  };

  // Rafraîchir les infos utilisateur
  const refreshUser = async () => {
    try {
      const response = await authenticatedFetch('/api/auth/profile');
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  };

  const value = {
    // État
    user,
    token,
    loading,
    
    // Actions d'authentification
    login,
    register,
    logout,
    verify2FA,
    generate2FA,
    disable2FA,
    
    // Utilitaires de vérification de rôles
    isAuthenticated,
    isAdmin,
    isMedecin,
    isPatient,
    hasRole,
    hasAnyRole,
    
    // Utilitaires avancés
    getAuthHeaders,
    authenticatedFetch,
    refreshUser,
    
    // Setters pour usage interne
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};