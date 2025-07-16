

// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mot de passe doit contenir au moins 6 caractères';
    }

    if (showTwoFactor && !formData.twoFactorCode) {
      newErrors.twoFactorCode = 'Code 2FA requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // CHANGÉ: Passer les paramètres individuellement comme attendu par authService
      await login(
        formData.email,
        formData.password,
        showTwoFactor ? formData.twoFactorCode : null
      );
      // Navigation will be handled by useEffect
    } catch (error) {
      console.error('Login error:', error);
      
      // Si l'erreur indique que le 2FA est requis
      if (error.message && error.message.includes('2FA') && !showTwoFactor) {
        setRequiresTwoFactor(true);
        setShowTwoFactor(true);
        setErrors({ twoFactorCode: 'Code d\'authentification requis' });
      } else {
        setErrors({ general: error.message || 'Erreur lors de la connexion' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="votre@email.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {showTwoFactor && (
            <div className="form-group">
              <label htmlFor="twoFactorCode">Code d'authentification</label>
              <input
                type="text"
                id="twoFactorCode"
                name="twoFactorCode"
                value={formData.twoFactorCode}
                onChange={handleChange}
                className={errors.twoFactorCode ? 'error' : ''}
                placeholder="123456"
                maxLength="6"
                disabled={isLoading}
              />
              {errors.twoFactorCode && (
                <span className="error-message">{errors.twoFactorCode}</span>
              )}
              <small className="help-text">
                Entrez le code à 6 chiffres de votre application d'authentification
              </small>
            </div>
          )}
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              Se souvenir de moi
            </label>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <div className="auth-links">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
            <Link to="/register">Créer un compte</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;