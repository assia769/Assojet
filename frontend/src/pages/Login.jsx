// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/components/login.css';

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
      }else if (result.user.role === 'secretaire') {
        navigate('/secretary');
      }else {
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
    <div className="login-page">
      {/* Particules médicales flottantes */}
      <div className="medical-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Croix médicales animées */}
      <div className="medical-crosses">
        <div className="medical-cross"></div>
        <div className="medical-cross"></div>
        <div className="medical-cross"></div>
      </div>

      {/* DNA Helix */}
      <div className="dna-helix">
        <div className="dna-strand"></div>
        <div className="dna-strand"></div>
      </div>

      {/* Heartbeat */}
      <div className="heartbeat"></div>

      {/* Pulse Wave */}
      <div className="pulse-wave">
        <div className="pulse-line"></div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="medical-logo"></div>
          <h1 className="login-title">Connexion Médicale</h1>
          <p className="login-subtitle">
            🌟 Votre portail sécurisé vers l'excellence médicale 🌟
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            <strong>Erreur:</strong> {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Adresse Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="exemple@email.com"
                autoComplete="email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            <div className="button-content">
              {loading && <div className="loading-spinner"></div>}
              <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            </div>
          </button>
        </form>
        
        <div className="medical-footer">
          <span>🚀 Cabinet Médical Premium - Technologie de Pointe 🚀</span>
        </div>
      </div>
    </div>
  );
};

export default Login;