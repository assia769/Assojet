// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Login form: Submitting with email:', formData.email);
      
      const result = await login(formData.email, formData.password);
      
      console.log('✅ Login form: Login successful', result);
      
      // Vérifier que le token est bien stocké
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Login form: Post-login check');
      console.log('- Token stored:', !!storedToken);
      console.log('- User stored:', !!storedUser);
      
      if (!storedToken || !storedUser) {
        throw new Error('Erreur de stockage des données de connexion');
      }
      
      // Redirection basée sur le rôle
      if (result.user.role === 'admin') {
        console.log('🔄 Redirecting to admin dashboard');
        navigate('/admin');
      } else if (result.user.role === 'medecin') {
        console.log('🔄 Redirecting to doctor dashboard');
        navigate('/doctor/dashboard');
      } else {
        console.log('🔄 Redirecting to patient dashboard');
        navigate('/patient/dashboard');
      }
      
    } catch (err) {
      console.error('❌ Login form: Login failed:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🔐 Connexion
      </h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Erreur:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            📧 Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            🔒 Mot de passe:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔄 Connexion...' : '🚀 Se connecter'}
        </button>
      </form>
      
      
    </div>
  );
};

export default Login;