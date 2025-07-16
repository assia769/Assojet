// frontend/src/components/AuthDebug.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AuthDebug = () => {
  const [authInfo, setAuthInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Vérifier les informations d'authentification
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setAuthInfo({
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'Aucun token',
      user: user ? JSON.parse(user) : null
    });
  }, []);

  const testAuth = async () => {
    try {
      console.log('🧪 Testing authentication...');
      const response = await api.get('/test');
      setTestResult({ success: true, data: response.data });
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      setTestResult({ success: false, error: error.message });
    }
  };

  const testAdminAuth = async () => {
    try {
      console.log('🧪 Testing admin authentication...');
      const response = await api.get('/admin/dashboard/stats');
      setTestResult({ success: true, data: response.data });
    } catch (error) {
      console.error('❌ Admin auth test failed:', error);
      setTestResult({ success: false, error: error.message });
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px' }}>
      <h3>🔍 Debug Authentification</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Informations d'authentification :</h4>
        <pre>{JSON.stringify(authInfo, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testAuth} style={{ marginRight: '10px' }}>
          Test API Base
        </button>
        <button onClick={testAdminAuth}>
          Test Admin API
        </button>
      </div>

      {testResult && (
        <div>
          <h4>Résultat du test :</h4>
          <pre style={{ 
            background: testResult.success ? '#d4edda' : '#f8d7da',
            color: testResult.success ? '#155724' : '#721c24',
            padding: '10px'
          }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;