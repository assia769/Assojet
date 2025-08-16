// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/components/login.css';

// ✅ COMPOSANT VERIFY2FA CORRIGÉ
const Verify2FA = ({ tempToken, qrCode, secret, userEmail, onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(qrCode ? 'setup' : 'verify');
  const [showSkipOption, setShowSkipOption] = useState(qrCode ? true : false);
  const { verify2FA, bypass2FA } = useAuth();

  useEffect(() => {
    console.log('🔍 Verify2FA Component Props:', {
      hasTempToken: !!tempToken,
      hasQrCode: !!qrCode,
      hasSecret: !!secret,
      userEmail,
      step,
      showSkipOption
    });
  }, [tempToken, qrCode, secret, userEmail, step, showSkipOption]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Accepter le code par défaut 123456 OU un code à 6 chiffres
    if (!code || (code !== '123456' && code.length !== 6)) {
      setError('Veuillez entrer un code à 6 chiffres ou utilisez le code par défaut 123456');
      return;
    }

    if (!tempToken) {
      setError('Token temporaire manquant. Veuillez vous reconnecter.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🔐 Verify2FA: Starting verification with code:', code.substring(0, 2) + '****');
      
      // ✅ Log spécial pour le code par défaut
      if (code === '123456') {
        console.log('🚀 Using default bypass code');
      }
      
      const isSetup = step === 'setup';
      const result = await verify2FA(tempToken, code, isSetup);
      
      console.log('✅ Verify2FA: Verification successful');
      onSuccess(result);
      
    } catch (error) {
      console.error('❌ Verify2FA error:', error);
      setError(error.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FONCTION SKIP 2FA CORRIGÉE
  const handleSkip2FA = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('⚠️ Skipping 2FA setup for doctor');
      
      // Utiliser la fonction bypass2FA du contexte
      const result = await bypass2FA(tempToken, userEmail);
      
      console.log('✅ Skip 2FA successful');
      onSuccess(result);
      
    } catch (error) {
      console.error('❌ Error skipping 2FA:', error);
      setError('Erreur lors de l\'accès temporaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Particules et animations */}
      <div className="medical-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className="medical-crosses">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="medical-cross"></div>
        ))}
      </div>

      <div className="dna-helix">
        <div className="dna-strand"></div>
        <div className="dna-strand"></div>
      </div>

      <div className="heartbeat"></div>

      <div className="pulse-wave">
        <div className="pulse-line"></div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="medical-logo"></div>
          <h1 className="login-title">
            {step === 'setup' ? '🔧 Configuration 2FA Médecin' : '🔐 Authentification 2FA'}
          </h1>
          <p className="login-subtitle">
            {step === 'setup' 
              ? '📱 Scannez le QR Code avec votre app d\'authentification'
              : '🔐 Entrez le code de votre application d\'authentification'
            }
          </p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        {/* ✅ SECTION CODE PAR DÉFAUT */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '2px solid #0ea5e9',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            color: '#0ea5e9', 
            margin: '0 0 0.5rem 0',
            fontSize: '1.1rem'
          }}>
            🚀 Code de développement disponible
          </h3>
          <p style={{ 
            margin: '0 0 0.5rem 0', 
            color: '#0369a1',
            fontSize: '0.9rem'
          }}>
            Utilisez le code <strong>123456</strong> pour un accès rapide
          </p>
          <code style={{
            backgroundColor: '#0ea5e9',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            letterSpacing: '0.5rem'
          }}>
            123456
          </code>
        </div>

        {/* Affichage du QR Code */}
        {step === 'setup' && qrCode && (
          <div className="qr-code-section" style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              color: '#059669',
              fontSize: '1.2rem'
            }}>
              📱 Étape 1: Scannez ce QR Code
            </h3>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              display: 'inline-block',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <img 
                src={qrCode} 
                alt="QR Code 2FA" 
                style={{ 
                  width: '220px', 
                  height: '220px',
                  borderRadius: '8px'
                }} 
                onError={(e) => {
                  console.error('❌ QR Code image failed to load:', e);
                  setError('Erreur lors du chargement du QR Code');
                }}
              />
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#dbeafe', 
                borderRadius: '8px',
                border: '1px solid #3b82f6'
              }}>
                <p style={{ 
                  color: '#1e40af', 
                  margin: 0, 
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  📲 Applications recommandées
                </p>
                <ul style={{ 
                  margin: '0.5rem 0 0 0', 
                  paddingLeft: '1rem',
                  color: '#1e40af',
                  fontSize: '0.85rem'
                }}>
                  <li>Google Authenticator</li>
                  <li>Microsoft Authenticator</li>
                  <li>Authy</li>
                </ul>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fef3c7', 
                borderRadius: '8px',
                border: '1px solid #f59e0b'
              }}>
                <p style={{ 
                  color: '#92400e', 
                  margin: 0, 
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  🔑 Clé manuelle
                </p>
                {secret && (
                  <code style={{ 
                    display: 'block',
                    marginTop: '0.5rem',
                    backgroundColor: '#ffffff', 
                    padding: '6px 8px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    wordBreak: 'break-all',
                    color: '#92400e',
                    border: '1px solid #f59e0b'
                  }}>
                    {secret}
                  </code>
                )}
              </div>
            </div>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="code" style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: step === 'setup' ? '#059669' : '#374151'
            }}>
              {step === 'setup' 
                ? '📱 Étape 2: Code de votre app (6 chiffres) ou 123456'
                : '🔐 Code de vérification (6 chiffres) ou 123456'
              }
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value;
                // Permettre 123456 ou seulement des chiffres
                if (value === '123456' || /^\d*$/.test(value)) {
                  setCode(value.slice(0, 6));
                }
              }}
              placeholder="000000 ou 123456"
              className="form-input"
              style={{ 
                textAlign: 'center', 
                fontSize: '2.2rem', 
                letterSpacing: '1rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                backgroundColor: code === '123456' ? '#f0f9ff' : (step === 'setup' ? '#f0fdf4' : '#ffffff'),
                border: code === '123456' ? '2px solid #0ea5e9' : (step === 'setup' ? '2px solid #10b981' : '2px solid #e2e8f0'),
                padding: '1rem',
                borderRadius: '12px'
              }}
              maxLength={6}
              autoComplete="one-time-code"
              required
              autoFocus
            />
          </div>

          <div className="form-actions" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <button
              type="submit"
              disabled={loading || (!code || (code !== '123456' && code.length !== 6)) || !tempToken}
              className="login-button"
              style={{ 
                backgroundColor: code === '123456' ? '#0ea5e9' : (step === 'setup' ? '#10b981' : '#3b82f6'),
                fontSize: '1.1rem',
                fontWeight: '600'
              }}
            >
              <div className="button-content">
                {loading && <div className="loading-spinner"></div>}
                <span>
                  {loading 
                    ? (step === 'setup' ? 'Configuration...' : 'Vérification...') 
                    : (code === '123456' ? '🚀 Accès Rapide (Dev)' : (step === 'setup' ? '🚀 Activer la sécurité 2FA' : '🔓 Vérifier le code'))
                  }
                </span>
              </div>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onBack}
                className="login-button"
                disabled={loading}
                style={{ 
                  backgroundColor: '#6b7280', 
                  flex: 1,
                  fontSize: '0.95rem'
                }}
              >
                ← Retour à la connexion
              </button>
              
              {showSkipOption && step === 'setup' && (
                <button
                  type="button"
                  onClick={handleSkip2FA}
                  disabled={loading}
                  className="login-button"
                  style={{ 
                    backgroundColor: '#f59e0b', 
                    flex: 1,
                    fontSize: '0.95rem'
                  }}
                >
                  {loading ? 'Accès...' : '⏭️ Accès Direct'}
                </button>
              )}
            </div>
          </div>
        </form>

        {showSkipOption && step === 'setup' && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #f87171'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.85rem',
              color: '#dc2626',
              textAlign: 'center'
            }}>
              ⚠️ <strong>Important :</strong> La sécurité 2FA est fortement recommandée pour les médecins.
            </p>
          </div>
        )}

        <div className="medical-footer">
          <span>
            {step === 'setup' 
              ? '🛡️ Configuration de la sécurité renforcée'
              : '🔒 Authentification à deux facteurs'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

// ✅ COMPOSANT LOGIN PRINCIPAL CORRIGÉ
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [is2FASetup, setIs2FASetup] = useState(false);
  
  const { login, generate2FA } = useAuth();
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
      console.log('🔐 Login form: Starting login process');
      
      const result = await login(formData.email, formData.password);
      
      console.log('✅ Login response:', result);

      // ✅ Vérifier si requires2FA est true
      if (result.requires2FA) {
        console.log('🔐 2FA required - showing verification');
        
        // Pour tout utilisateur nécessitant 2FA, essayer de générer le QR code d'abord
        try {
          await generateQRForDoctor(formData.email, result.tempToken);
          return;
        } catch (qrError) {
          console.log('⚠️ QR generation failed, using verification only mode');
          // Si QR génération échoue, mode vérification simple
          setRequires2FA(true);
          setTempToken(result.tempToken);
          setUserEmail(formData.email);
          setIs2FASetup(false);
          setQrCode('');
          setSecret('');
          return;
        }
      }

      // Si pas de 2FA requis, connexion directe
      handleSuccessfulLogin(result);
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const generateQRForDoctor = async (email, loginTempToken) => {
    try {
      console.log('🔧 Generating QR code for 2FA setup');
      
      const qrResult = await generate2FA(email);
      
      console.log('✅ QR code generated successfully');
      
      if (!qrResult.qrCode || !qrResult.secret) {
        throw new Error('QR Code ou secret manquant');
      }
      
      setRequires2FA(true);
      setQrCode(qrResult.qrCode);
      setSecret(qrResult.secret);
      setTempToken(loginTempToken);
      setUserEmail(email);
      setIs2FASetup(true);
      
    } catch (error) {
      console.error('❌ QR generation failed:', error);
      throw error;
    }
  };

  // ✅ FONCTION handleSuccessfulLogin CORRIGÉE
  const handleSuccessfulLogin = (result) => {
    console.log('✅ Login successful', result);
    
    if (!result.user && !result.token) {
      console.error('❌ No user data or token in result');
      setError('Données de connexion manquantes');
      return;
    }
    
    // Si les données ne sont pas stockées, les stocker
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken && result.token) {
      localStorage.setItem('authToken', result.token);
    }
    
    if (!storedUser && result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    // Redirection basée sur le rôle
    const userRole = result.user?.role || JSON.parse(localStorage.getItem('user') || '{}').role;
    console.log('🔄 User role for redirection:', userRole);
    
    if (userRole) {
      redirectUser(userRole);
    } else {
      console.error('❌ No user role found');
      setError('Rôle utilisateur non défini');
    }
  };

  const handle2FASuccess = (result) => {
    console.log('✅ 2FA verification successful', result);
    
    // Reset l'état 2FA
    setRequires2FA(false);
    setTempToken('');
    setQrCode('');
    setSecret('');
    setUserEmail('');
    setIs2FASetup(false);
    
    // Gestion de la connexion réussie
    handleSuccessfulLogin(result);
  };

  const handle2FACancel = () => {
    console.log('❌ 2FA cancelled by user');
    
    // Reset complet de l'état 2FA
    setRequires2FA(false);
    setTempToken('');
    setQrCode('');
    setSecret('');
    setUserEmail('');
    setIs2FASetup(false);
    
    // Nettoyer le localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    setError('');
  };

  // ✅ FONCTION redirectUser CORRIGÉE AVEC LOGS
  const redirectUser = (role) => {
    console.log('🔄 Redirecting user with role:', role);
    
    switch(role) {
      case 'admin':
        console.log('🔄 Redirecting to /admin');
        navigate('/admin');
        break;
      case 'medecin':
        console.log('🔄 Redirecting to /doctor');
        navigate('/doctor');
        break;
      case 'secretaire':
        console.log('🔄 Redirecting to /secretary');
        navigate('/secretary');
        break;
      case 'patient':
      default:
        console.log('🔄 Redirecting to /patient');
        navigate('/patient');
        break;
    }
  };

  // Afficher le composant de 2FA
  if (requires2FA) {
    return (
      <Verify2FA
        tempToken={tempToken}
        qrCode={qrCode}
        secret={secret}
        userEmail={userEmail}
        onSuccess={handle2FASuccess}
        onBack={handle2FACancel}
      />
    );
  }

  // Formulaire de connexion principal
  return (
    <div className="login-page">
      {/* Particules médicales flottantes */}
      <div className="medical-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className="medical-crosses">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="medical-cross"></div>
        ))}
      </div>

      <div className="dna-helix">
        <div className="dna-strand"></div>
        <div className="dna-strand"></div>
      </div>

      <div className="heartbeat"></div>

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
          <div className="security-notice" style={{ marginTop: '0.5rem' }}>
            <small style={{ color: '#10b981' }}>🔒 Sécurisé avec authentification 2FA</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;