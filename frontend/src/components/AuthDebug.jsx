// frontend/src/components/AuthDebug.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AuthDebug = () => {
  const { user, token, isAuthenticated, isAdmin } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [adminTestResult, setAdminTestResult] = useState(null);

  const testAPI = async () => {
    try {
      console.log('🧪 Testing base API...');
      const response = await api.get('/test');
      setTestResult({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error('❌ API test failed:', error);
      setTestResult({
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  };

  const testAdminAPI = async () => {
    try {
      console.log('🧪 Testing admin API...');
      const response = await api.get('/admin/settings/dashboard/stats');
      setAdminTestResult({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error('❌ Admin API test failed:', error);
      setAdminTestResult({
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Récupérer les infos directement du localStorage pour comparaison
  const storedToken = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('user');

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '15px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6',
      borderRadius: '5px',
      fontSize: '14px'
    }}>
      <h3>🔍 Debug Authentification</h3>
      
      {/* Informations d'authentification */}
      <div style={{ marginBottom: '15px' }}>
        <h4>Informations d'authentification :</h4>
        <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px', fontSize: '12px' }}>
{JSON.stringify({
  // Context state
  contextToken: token ? `${token.substring(0, 20)}...` : 'Aucun token',
  contextUser: user,
  isAuthenticated: isAuthenticated(),
  isAdmin: isAdmin(),
  
  // LocalStorage state
  storedToken: storedToken ? `${storedToken.substring(0, 20)}...` : 'Aucun token',
  storedUser: storedUser ? JSON.parse(storedUser) : null,
  
  // Comparison
  tokenMatch: token === storedToken,
  userMatch: JSON.stringify(user) === storedUser
}, null, 2)}
        </pre>
      </div>

      {/* Actions de debug */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={testAPI}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Test API Base
        </button>
        
        <button 
          onClick={testAdminAPI}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Test Admin API
        </button>
        
        <button 
          onClick={clearStorage}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Clear Storage
        </button>
      </div>

      {/* Résultats des tests */}
      {testResult && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Résultat du test API Base :</h4>
          <pre style={{ 
            backgroundColor: testResult.success ? '#d4edda' : '#f8d7da', 
            padding: '10px', 
            borderRadius: '3px',
            fontSize: '12px'
          }}>
{JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {adminTestResult && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Résultat du test Admin API :</h4>
          <pre style={{ 
            backgroundColor: adminTestResult.success ? '#d4edda' : '#f8d7da', 
            padding: '10px', 
            borderRadius: '3px',
            fontSize: '12px'
          }}>
{JSON.stringify(adminTestResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Headers de la prochaine requête */}
      <div>
        <h4>Headers de la prochaine requête :</h4>
        <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px', fontSize: '12px' }}>
{JSON.stringify({
  'Content-Type': 'application/json',
  'Authorization': storedToken ? `Bearer ${storedToken.substring(0, 20)}...` : 'Aucun token'
}, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AuthDebug;