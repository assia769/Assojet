// // frontend/src/context/AuthContext.js
// import React, { createContext, useContext, useState, useEffect } from 'react';

// // Créer et EXPORTER le contexte
// export const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// // Configuration de l'URL de base de l'API
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Initialiser l'état depuis localStorage au montage
//   useEffect(() => {
//     const initializeAuth = () => {
//       try {
//         const storedToken = localStorage.getItem('authToken');
//         const storedUser = localStorage.getItem('user');

//         if (storedToken && storedUser) {
//           setToken(storedToken);
//           setUser(JSON.parse(storedUser));
//           console.log('✅ Auth initialized from localStorage');
//         }
//       } catch (error) {
//         console.error('❌ Error initializing auth:', error);
//         // Nettoyer si les données sont corrompues
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('user');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   // Enregistrement classique
//   const register = async (userData) => {
//     try {
//       setLoading(true);
//       console.log('📝 Attempting registration...');
      
//       // Nettoyer le token existant avant l'inscription
//       const existingToken = localStorage.getItem('authToken');
//       if (existingToken) {
//         console.log('🧹 Clearing existing token before registration');
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('user');
//         setToken(null);
//         setUser(null);
//       }
      
//       const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();
//       console.log('🧾 Register response:', data);
      
//       if (!data.success) {
//         throw new Error(data.message || 'Erreur d\'inscription');
//       }
      
//       // Ne pas stocker le token - juste retourner le succès
//       if (data.user) {
//         console.log('✅ Registration successful - user not logged in automatically');
        
//         return { 
//           success: true, 
//           user: data.user,
//           message: 'Inscription réussie. Veuillez vous connecter.'
//         };
//       } else {
//         throw new Error('Réponse d\'inscription invalide');
//       }
//     } catch (error) {
//       console.error('❌ Registration error:', error);
      
//       // S'assurer que rien n'est stocké en cas d'erreur
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('user');
//       setToken(null);
//       setUser(null);
      
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

// // AuthContext.js - Fonction login modifiée

// const login = async (email, password) => {
//   try {
//     console.log('🔐 AuthContext: Starting login for:', email);
    
//     const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ email, password })
//     });

//     console.log('📡 Login response status:', response.status);

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('❌ Login error response:', errorData);
//       throw new Error(errorData.message || 'Erreur de connexion');
//     }

//     const data = await response.json();
//     console.log('✅ Login response data:', data);
//     console.log('📋 Login details:', {
//       success: data.success,
//       requires2FA: data.requires2FA,
//       userRole: data.user?.role,
//       hasToken: !!data.token,
//       hasTempToken: !!data.tempToken
//     });

//     // ✅ Si connexion directe réussie (pas de 2FA requis)
//     if (data.success && !data.requires2FA && data.token) {
//       console.log('🎉 Direct login successful - storing tokens');
      
//       // Stocker les tokens pour connexion directe
//       localStorage.setItem('authToken', data.token);
//       localStorage.setItem('user', JSON.stringify(data.user));
      
//       // Mettre à jour le contexte
//       setToken(data.token);
//       setUser(data.user);
//       // setIsAuthenticated(true);
      
//       console.log('✅ AuthContext updated for direct login');
//     }
//     // ✅ Si 2FA requis (médecins)
//     else if (data.success && data.requires2FA) {
//       console.log('🔐 2FA required - not storing permanent tokens yet');
//       // Ne pas stocker les tokens permanents - attendre la vérification 2FA
//       // Les tokens seront stockés après vérification 2FA réussie
//     }

//     return data;

//   } catch (error) {
//     console.error('❌ AuthContext login error:', error);
//     throw error;
//   }
// };

// // ✅ Fonction verify2FA modifiée pour stocker les tokens après vérification
// const verify2FA = async (tempToken, code, isSetup = false) => {
//   try {
//     console.log('🔐 AuthContext: Verifying 2FA code');
//     console.log('📝 Verify2FA params:', {
//       hasTempToken: !!tempToken,
//       code: code.substring(0, 2) + '****',
//       isSetup
//     });
    
//     const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${tempToken}`
//       },
//       body: JSON.stringify({ code, isSetup })
//     });

//     console.log('📡 Verify2FA response status:', response.status);

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('❌ Verify2FA error response:', errorData);
//       throw new Error(errorData.message || 'Code 2FA invalide');
//     }

//     const data = await response.json();
//     console.log('✅ Verify2FA response data:', data);

//     // ✅ Après vérification 2FA réussie, stocker les tokens permanents
//     if (data.success && data.token) {
//       console.log('🎉 2FA verification successful - storing permanent tokens');
      
//       localStorage.setItem('authToken', data.token);
//       localStorage.setItem('user', JSON.stringify(data.user));
      
//       // Mettre à jour le contexte
//       setToken(data.token);
//       setUser(data.user);
//       // setIsAuthenticated(true);
      
//       console.log('✅ AuthContext updated after 2FA verification');
//     }

//     return data;

//   } catch (error) {
//     console.error('❌ AuthContext 2FA verification error:', error);
//     throw error;
//   }
// };

  
// // AuthContext.js - Fonction generate2FA corrigée

// const generate2FA = async (email) => {
//   try {
//     console.log('🔐 AuthContext: Generating 2FA QR Code for email:', email);
    
//     const response = await fetch(`${API_BASE_URL}/api/auth/generate-2fa`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token || 'no-token-needed-for-generation'}`
//       },
//       body: JSON.stringify({ email })
//     });

//     console.log('📡 Generate2FA Response status:', response.status);
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('❌ Generate2FA Response error:', errorData);
//       throw new Error(errorData.message || 'Erreur lors de la génération du QR Code');
//     }

//     const data = await response.json();
//     console.log('📡 Generate2FA Response data:', data);

//     // ✅ FIX: Ne pas vérifier tempToken car il n'est pas retourné par cette route
//     // Vérifier seulement les données essentielles du QR Code
//     if (!data.success || !data.qrCode || !data.secret) {
//       console.error('❌ AuthContext: QR Code data incomplete:', data);
//       throw new Error('Données QR Code incomplètes (qrCode ou secret manquant)');
//     }

//     console.log('✅ AuthContext: QR Code generation successful');
    
//     // ✅ FIX: Retourner les données avec un tempToken généré côté client si nécessaire
//     // ou utiliser une approche différente pour gérer le token temporaire
//     return {
//       qrCode: data.qrCode,
//       secret: data.secret,
//       backupCodes: data.backupCodes,
//       // Utiliser un token temporaire pour la session de configuration
//       tempToken: `temp_${Date.now()}_${email}` // Token temporaire pour cette session
//     };
    
//   } catch (error) {
//     console.error('❌ AuthContext: QR Code generation failed:', error);
//     throw error;
//   }
// };
//   // Désactiver 2FA
//   const disable2FA = async (password) => {
//     try {
//       console.log('🔐 AuthContext: Disabling 2FA');
      
//       const response = await fetch(`${API_BASE_URL}/api/auth/disable-2fa`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ password }),
//       });

//       const data = await response.json();

//       if (!data.success) {
//         throw new Error(data.message || 'Erreur désactivation 2FA');
//       }

//       // Mettre à jour l'utilisateur local
//       const updatedUser = { ...user, twofa_enabled: false };
//       setUser(updatedUser);
//       localStorage.setItem('user', JSON.stringify(updatedUser));

//       console.log('✅ AuthContext: 2FA disabled');
//       return data;

//     } catch (error) {
//       console.error('❌ AuthContext: 2FA disable failed:', error);
//       throw error;
//     }
//   };

//   // Logout
//   const logout = () => {
//     console.log('🚪 AuthContext: Logging out');
    
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('user');
    
//     setToken(null);
//     setUser(null);
    
//     console.log('✅ Logout completed');
//   };

//   // Vérifier si l'utilisateur est authentifié
//   const isAuthenticated = () => {
//     return !!(token && user);
//   };

//   // Méthodes de vérification de rôles
//   const isAdmin = () => {
//     return user?.role === 'admin';
//   };

//   const isMedecin = () => {
//     return user?.role === 'medecin';
//   };

//   const isPatient = () => {
//     return user?.role === 'patient';
//   };

//   // Vérifier si l'utilisateur a un rôle spécifique
//   const hasRole = (role) => {
//     return user?.role === role;
//   };

//   // Vérifier si l'utilisateur a l'un des rôles spécifiés
//   const hasAnyRole = (roles) => {
//     return roles.includes(user?.role);
//   };

//   // Obtenir les en-têtes d'autorisation
//   const getAuthHeaders = () => {
//     if (!token) return {};
    
//     return {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     };
//   };

//   // Faire une requête authentifiée
//   const authenticatedFetch = async (url, options = {}) => {
//     const headers = {
//       ...getAuthHeaders(),
//       ...options.headers,
//     };

//     const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

//     const response = await fetch(fullUrl, {
//       ...options,
//       headers,
//     });

//     // Si token expiré ou invalide
//     if (response.status === 401) {
//       console.warn('⚠️ Token expired or invalid, logging out');
//       logout();
//       throw new Error('Session expirée, veuillez vous reconnecter');
//     }

//     return response;
//   };

//   // Rafraîchir les infos utilisateur
//   const refreshUser = async () => {
//     try {
//       const response = await authenticatedFetch('/api/auth/profile');
//       const data = await response.json();

//       if (data.success) {
//         setUser(data.user);
//         localStorage.setItem('user', JSON.stringify(data.user));
//       }
//     } catch (error) {
//       console.error('❌ Error refreshing user:', error);
//     }
//   };

//   const value = {
//     // État
//     user,
//     token,
//     loading,
    
//     // Actions d'authentification
//     login,
//     register,
//     logout,
//     verify2FA,
//     generate2FA,
//     disable2FA,
    
//     // Utilitaires de vérification de rôles
//     isAuthenticated,
//     isAdmin,
//     isMedecin,
//     isPatient,
//     hasRole,
//     hasAnyRole,
    
//     // Utilitaires avancés
//     getAuthHeaders,
//     authenticatedFetch,
//     refreshUser,
    
//     // Setters pour usage interne
//     setUser,
//     setToken,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; 
const API_BASE_URL = 'https://assojet-production.up.railway.app' || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('📝 Attempting registration...');
      
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
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Starting login for:', email);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Login error response:', errorData);
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      const data = await response.json();
      console.log('✅ Login response data:', data);
      console.log('📋 Login details:', {
        success: data.success,
        requires2FA: data.requires2FA,
        userRole: data.user?.role,
        hasToken: !!data.token,
        hasTempToken: !!data.tempToken
      });

      // ✅ Si connexion directe réussie (pas de 2FA requis)
      if (data.success && !data.requires2FA && data.token) {
        console.log('🎉 Direct login successful - storing tokens');
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setToken(data.token);
        setUser(data.user);
        
        console.log('✅ AuthContext updated for direct login');
      }
      // ✅ Si 2FA requis (médecins)
      else if (data.success && data.requires2FA) {
        console.log('🔐 2FA required - not storing permanent tokens yet');
      }

      return data;

    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      throw error;
    }
  };

  // ✅ FONCTION VERIFY2FA AMÉLIORÉE
  const verify2FA = async (tempToken, code, isSetup = false) => {
    try {
      console.log('🔐 AuthContext: Verifying 2FA code');
      console.log('📝 Verify2FA params:', {
        hasTempToken: !!tempToken,
        code: code.substring(0, 2) + '****',
        isSetup,
        isDefaultCode: code === '123456'
      });
      
      // ✅ Si c'est le code par défaut, log spécial
      if (code === '123456') {
        console.log('🚀 Using default bypass code 123456');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ code, isSetup })
      });

      console.log('📡 Verify2FA response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Verify2FA error response:', errorData);
        throw new Error(errorData.message || 'Code 2FA invalide');
      }

      const data = await response.json();
      console.log('✅ Verify2FA response data:', data);

      // ✅ Après vérification 2FA réussie, stocker les tokens permanents
      if (data.success && data.token) {
        console.log('🎉 2FA verification successful - storing permanent tokens');
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setToken(data.token);
        setUser(data.user);
        
        console.log('✅ AuthContext updated after 2FA verification');
        console.log('🔄 User role for redirection:', data.user.role);
      }

      return data;

    } catch (error) {
      console.error('❌ AuthContext 2FA verification error:', error);
      throw error;
    }
  };

  // ✅ FONCTION GENERATE2FA CORRIGÉE
  const generate2FA = async (email) => {
    try {
      console.log('🔐 AuthContext: Generating 2FA QR Code for email:', email);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/generate-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      console.log('📡 Generate2FA Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Generate2FA Response error:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la génération du QR Code');
      }

      const data = await response.json();
      console.log('📡 Generate2FA Response data:', data);

      if (!data.success || !data.qrCode || !data.secret) {
        console.error('❌ AuthContext: QR Code data incomplete:', data);
        throw new Error('Données QR Code incomplètes');
      }

      console.log('✅ AuthContext: QR Code generation successful');
      
      return {
        qrCode: data.qrCode,
        secret: data.secret,
        backupCodes: data.backupCodes || []
      };
      
    } catch (error) {
      console.error('❌ AuthContext: QR Code generation failed:', error);
      throw error;
    }
  };

  // ✅ BYPASS 2FA POUR IGNORER
  const bypass2FA = async (tempToken, userEmail) => {
    try {
      console.log('⚠️ AuthContext: Bypassing 2FA for immediate access');
      
      // Utiliser le code par défaut pour bypass
      const result = await verify2FA(tempToken, '123456', false);
      
      console.log('✅ 2FA bypass successful');
      return result;
      
    } catch (error) {
      console.error('❌ AuthContext: 2FA bypass failed:', error);
      throw error;
    }
  };

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

  const logout = () => {
    console.log('🚪 AuthContext: Logging out');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    
    console.log('✅ Logout completed');
  };

  const isAuthenticated = () => {
    return !!(token && user);
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

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const getAuthHeaders = () => {
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

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
    bypass2FA, // ✅ Nouvelle fonction bypass
    
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