
// // frontend/src/pages/Login.jsx
// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import '../styles/components/login.css';

// // Composant pour vérifier le code 2FA
// const Verify2FA = ({ tempToken, onSuccess, onBack }) => {
//   const [code, setCode] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { verify2FA } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!code || code.length !== 6) {
//       setError('Veuillez entrer un code à 6 chiffres');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError('');
      
//       const result = await verify2FA(tempToken, code);
//       onSuccess(result);
//     } catch (error) {
//       setError(error.message || 'Code invalide');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       {/* Mêmes particules et animations que le login principal */}
//       <div className="medical-particles">
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//       </div>

//       <div className="medical-crosses">
//         <div className="medical-cross"></div>
//         <div className="medical-cross"></div>
//         <div className="medical-cross"></div>
//       </div>

//       <div className="dna-helix">
//         <div className="dna-strand"></div>
//         <div className="dna-strand"></div>
//       </div>

//       <div className="heartbeat"></div>

//       <div className="pulse-wave">
//         <div className="pulse-line"></div>
//       </div>

//       <div className="login-container">
//         <div className="login-header">
//           <div className="medical-logo"></div>
//           <h1 className="login-title">Authentification 2FA</h1>
//           <p className="login-subtitle">
//             🔐 Entrez le code de votre application d'authentification 🔐
//           </p>
//         </div>

//         {error && (
//           <div className="error-message">
//             <strong>Erreur:</strong> {error}
//           </div>
//         )}

//         <form className="login-form" onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label className="form-label" htmlFor="code">
//               Code de vérification (6 chiffres)
//             </label>
//             <input
//               id="code"
//               type="text"
//               value={code}
//               onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//               placeholder="000000"
//               className="form-input"
//               style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
//               maxLength={6}
//               autoComplete="one-time-code"
//               required
//             />
//           </div>

//           <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
//             <button
//               type="button"
//               onClick={onBack}
//               className="login-button"
//               style={{ backgroundColor: '#6b7280', flex: 1 }}
//             >
//               Retour
//             </button>
//             <button
//               type="submit"
//               disabled={loading || code.length !== 6}
//               className="login-button"
//               style={{ flex: 1 }}
//             >
//               <div className="button-content">
//                 {loading && <div className="loading-spinner"></div>}
//                 <span>{loading ? 'Vérification...' : 'Vérifier'}</span>
//               </div>
//             </button>
//           </div>
//         </form>

//         <div className="medical-footer">
//           <span>🔒 Sécurité renforcée - Authentification à deux facteurs</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Composant pour configurer le 2FA (première fois)
// const Setup2FA = ({ email, onSuccess, onBack }) => {
//   const [step, setStep] = useState('generate'); // 'generate' ou 'verify'
//   const [qrCode, setQrCode] = useState('');
//   const [secret, setSecret] = useState('');
//   const [tempToken, setTempToken] = useState('');
//   const [code, setCode] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { generate2FA, verify2FA } = useAuth();

//   React.useEffect(() => {
//     generateQRCode();
//   }, []);

//   const generateQRCode = async () => {
//     try {
//       setLoading(true);
//       const result = await generate2FA(email);
//       setQrCode(result.qrCode);
//       setSecret(result.secret);
//       setTempToken(result.tempToken);
//       setStep('verify');
//     } catch (error) {
//       setError(error.message || 'Erreur lors de la génération du QR Code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifySetup = async (e) => {
//     e.preventDefault();
//     if (!code || code.length !== 6) {
//       setError('Veuillez entrer un code à 6 chiffres');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError('');
      
//       const result = await verify2FA(tempToken, code, true); // isSetup = true
//       onSuccess(result);
//     } catch (error) {
//       setError(error.message || 'Code invalide');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       {/* Mêmes particules et animations */}
//       <div className="medical-particles">
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//       </div>

//       <div className="medical-crosses">
//         <div className="medical-cross"></div>
//         <div className="medical-cross"></div>
//         <div className="medical-cross"></div>
//       </div>

//       <div className="dna-helix">
//         <div className="dna-strand"></div>
//         <div className="dna-strand"></div>
//       </div>

//       <div className="heartbeat"></div>

//       <div className="pulse-wave">
//         <div className="pulse-line"></div>
//       </div>

//       <div className="login-container">
//         <div className="login-header">
//           <div className="medical-logo"></div>
//           <h1 className="login-title">Configuration 2FA</h1>
//           <p className="login-subtitle">
//             🔧 Configurez votre authentification à deux facteurs 🔧
//           </p>
//         </div>

//         {error && (
//           <div className="error-message">
//             <strong>Erreur:</strong> {error}
//           </div>
//         )}

//         {loading && step === 'generate' ? (
//           <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
//             <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
//             <p>Génération du QR Code...</p>
//           </div>
//         ) : step === 'verify' && qrCode ? (
//           <div className="setup-2fa-content">
//             <div className="qr-code-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
//               <h3 style={{ marginBottom: '1rem' }}>1. Scannez ce QR Code</h3>
//               <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
//                 <img src={qrCode} alt="QR Code 2FA" style={{ maxWidth: '200px', height: 'auto' }} />
//               </div>
//               <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
//                 Utilisez Google Authenticator, Authy ou une autre app compatible
//               </p>
//             </div>

//             <form className="login-form" onSubmit={handleVerifySetup}>
//               <div className="form-group">
//                 <label className="form-label" htmlFor="setup-code">
//                   2. Entrez le code généré (6 chiffres)
//                 </label>
//                 <input
//                   id="setup-code"
//                   type="text"
//                   value={code}
//                   onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   placeholder="000000"
//                   className="form-input"
//                   style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
//                   maxLength={6}
//                   autoComplete="one-time-code"
//                   required
//                 />
//               </div>

//               <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
//                 <button
//                   type="button"
//                   onClick={onBack}
//                   className="login-button"
//                   style={{ backgroundColor: '#6b7280', flex: 1 }}
//                 >
//                   Ignorer pour maintenant
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading || code.length !== 6}
//                   className="login-button"
//                   style={{ flex: 1 }}
//                 >
//                   <div className="button-content">
//                     {loading && <div className="loading-spinner"></div>}
//                     <span>{loading ? 'Configuration...' : 'Terminer'}</span>
//                   </div>
//                 </button>
//               </div>
//             </form>
//           </div>
//         ) : null}

//         <div className="medical-footer">
//           <span>🛡️ Sécurité renforcée - Configuration 2FA</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [requires2FA, setRequires2FA] = useState(false);
//   const [tempToken, setTempToken] = useState('');
//   const [showSetup2FA, setShowSetup2FA] = useState(false);
//   const [userEmail, setUserEmail] = useState('');
  
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       console.log('🔐 Login form: Submitting with email:', formData.email);
      
//       const result = await login(formData.email, formData.password);
      
//       console.log('✅ Login form: Login response', result);

//       // Si 2FA requis
//       if (result.requires2FA) {
//         console.log('🔐 2FA required');
//         setRequires2FA(true);
//         setTempToken(result.tempToken);
//         setUserEmail(formData.email);
//         return;
//       }

//       // Connexion réussie sans 2FA
//       handleSuccessfulLogin(result);
      
//     } catch (err) {
//       console.error('❌ Login form: Login failed:', err);
//       setError(err.message || 'Erreur de connexion');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSuccessfulLogin = (result) => {
//     console.log('✅ Login successful', result);
    
//     // Vérifier que le token est bien stocké
//     const storedToken = localStorage.getItem('authToken');
//     const storedUser = localStorage.getItem('user');
    
//     console.log('🔍 Login form: Post-login check');
//     console.log('- Token stored:', !!storedToken);
//     console.log('- User stored:', !!storedUser);
    
//     if (!storedToken || !storedUser) {
//       throw new Error('Erreur de stockage des données de connexion');
//     }
    
//     // Vérifier si c'est un médecin qui n'a pas encore configuré 2FA
//     if (result.user.role === 'medecin' && !result.user.twofa_enabled) {
//       console.log('🔧 Doctor needs to setup 2FA');
//       setShowSetup2FA(true);
//       setUserEmail(result.user.email);
//       return;
//     }
    
//     // Redirection basée sur le rôle
//     redirectUser(result.user.role);
//   };

//   const handle2FASuccess = (result) => {
//     console.log('✅ 2FA verification successful');
//     setRequires2FA(false);
//     setTempToken('');
//     handleSuccessfulLogin(result);
//   };

//   const handle2FACancel = () => {
//     console.log('❌ 2FA cancelled');
//     setRequires2FA(false);
//     setTempToken('');
//     setUserEmail('');
//   };

//   const handleSetup2FAComplete = (result) => {
//     console.log('✅ 2FA setup completed');
//     setShowSetup2FA(false);
//     handleSuccessfulLogin(result);
//   };

//   const handleSetup2FACancel = () => {
//     console.log('❌ 2FA setup cancelled');
//     setShowSetup2FA(false);
//     // Permettre l'accès sans 2FA pour cette fois
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     redirectUser(user.role);
//   };

//   const redirectUser = (role) => {
//     if (role === 'admin') {
//       console.log('🔄 Redirecting to admin dashboard');
//       navigate('/admin');
//     } else if (role === 'medecin') {
//       console.log('🔄 Redirecting to doctor dashboard');
//       navigate('/doctor');
//     } else if (role === 'secretaire') {
//       console.log('🔄 Redirecting to secretary dashboard');
//       navigate('/secretary');
//     } else {
//       console.log('🔄 Redirecting to patient dashboard');
//       navigate('/patient');
//     }
//   };

//   // Afficher le composant de vérification 2FA
//   if (requires2FA) {
//     return (
//       <Verify2FA
//         tempToken={tempToken}
//         onSuccess={handle2FASuccess}
//         onBack={handle2FACancel}
//       />
//     );
//   }

//   // Afficher le composant de configuration 2FA
//   if (showSetup2FA) {
//     return (
//       <Setup2FA
//         email={userEmail}
//         onSuccess={handleSetup2FAComplete}
//         onBack={handleSetup2FACancel}
//       />
//     );
//   }

//   // Formulaire de connexion principal
//   return (
//     <div className="login-page">
//       {/* Particules médicales flottantes */}
//       <div className="medical-particles">
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//         <div className="particle"></div>
//       </div>

//       {/* Croix médicales animées */}
//       <div className="medical-crosses">
//         <div className="medical-cross"></div>
//         <div className="medical-cross"></div>
//         <div className="medical-cross"></div>
//       </div>

//       {/* DNA Helix */}
//       <div className="dna-helix">
//         <div className="dna-strand"></div>
//         <div className="dna-strand"></div>
//       </div>

//       {/* Heartbeat */}
//       <div className="heartbeat"></div>

//       {/* Pulse Wave */}
//       <div className="pulse-wave">
//         <div className="pulse-line"></div>
//       </div>

//       <div className="login-container">
//         <div className="login-header">
//           <div className="medical-logo"></div>
//           <h1 className="login-title">Connexion Médicale</h1>
//           <p className="login-subtitle">
//             🌟 Votre portail sécurisé vers l'excellence médicale 🌟
//           </p>
//         </div>
        
//         {error && (
//           <div className="error-message">
//             <strong>Erreur:</strong> {error}
//           </div>
//         )}
        
//         <form className="login-form" onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label className="form-label" htmlFor="email">
//               Adresse Email
//             </label>
//             <div style={{ position: 'relative' }}>
//               <input
//                 id="email"
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="form-input"
//                 placeholder="exemple@email.com"
//                 autoComplete="email"
//               />
//             </div>
//           </div>
          
//           <div className="form-group">
//             <label className="form-label" htmlFor="password">
//               Mot de passe
//             </label>
//             <div style={{ position: 'relative' }}>
//               <input
//                 id="password"
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 className="form-input"
//                 placeholder="••••••••"
//                 autoComplete="current-password"
//               />
//             </div>
//           </div>
          
//           <button 
//             type="submit" 
//             disabled={loading}
//             className="login-button"
//           >
//             <div className="button-content">
//               {loading && <div className="loading-spinner"></div>}
//               <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
//             </div>
//           </button>
//         </form>
        
//         <div className="medical-footer">
//           <span>🚀 Cabinet Médical Premium - Technologie de Pointe 🚀</span>
//           <div className="security-notice" style={{ marginTop: '0.5rem' }}>
//             <small style={{ color: '#10b981' }}>🔒 Sécurisé avec authentification 2FA pour les médecins</small>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/components/login.css';

// Composant pour vérifier le code 2FA
const Verify2FA = ({ tempToken, onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { verify2FA } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🔐 Verify2FA: Verifying with tempToken:', tempToken ? 'exists' : 'missing');
      console.log('🔐 Verify2FA: Code:', code);
      
      const result = await verify2FA(tempToken, code);
      onSuccess(result);
    } catch (error) {
      console.error('❌ Verify2FA error:', error);
      setError(error.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Mêmes particules et animations que le login principal */}
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

      <div className="medical-crosses">
        <div className="medical-cross"></div>
        <div className="medical-cross"></div>
        <div className="medical-cross"></div>
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
          <h1 className="login-title">Authentification 2FA</h1>
          <p className="login-subtitle">
            🔐 Entrez le code de votre application d'authentification 🔐
          </p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="code">
              Code de vérification (6 chiffres)
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="form-input"
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
              maxLength={6}
              autoComplete="one-time-code"
              required
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onBack}
              className="login-button"
              style={{ backgroundColor: '#6b7280', flex: 1 }}
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="login-button"
              style={{ flex: 1 }}
            >
              <div className="button-content">
                {loading && <div className="loading-spinner"></div>}
                <span>{loading ? 'Vérification...' : 'Vérifier'}</span>
              </div>
            </button>
          </div>
        </form>

        <div className="medical-footer">
          <span>🔒 Sécurité renforcée - Authentification à deux facteurs</span>
        </div>
      </div>
    </div>
  );
};

// Composant pour configurer le 2FA (première fois)
const Setup2FA = ({ email, onSuccess, onBack }) => {
  const [step, setStep] = useState('generate'); // 'generate' ou 'verify'
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { generate2FA, verify2FA } = useAuth();

  React.useEffect(() => {
    if (step === 'generate') {
      generateQRCode();
    }
  }, [step]);

  // const generateQRCode = async () => {
  //   try {
  //     setLoading(true);
  //     setError('');
  //     console.log('🔧 Setup2FA: Generating QR Code for email:', email);
      
  //     const result = await generate2FA(email);
  //     console.log('🔧 Setup2FA: QR Code result:', result);
      
  //     if (!result.qrCode || !result.tempToken) {
  //       throw new Error('Données QR Code incomplètes');
  //     }
      
  //     setQrCode(result.qrCode);
  //     setSecret(result.secret);
  //     setTempToken(result.tempToken);
  //     setStep('verify');
      
  //     console.log('✅ Setup2FA: QR Code generated, tempToken:', result.tempToken ? 'exists' : 'missing');
  //   } catch (error) {
  //     console.error('❌ Setup2FA: QR Code generation failed:', error);
  //     setError(error.message || 'Erreur lors de la génération du QR Code');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
   const generateQRCode = async () => {
    try {
      setLoading(true);
      const result = await generate2FA(email);
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setTempToken(result.tempToken);
      setStep('verify');
    } catch (error) {
      setError(error.message || 'Erreur lors de la génération du QR Code');
    } finally {
      setLoading(false);
    }
  };


  const handleVerifySetup = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    if (!tempToken) {
      setError('Token temporaire manquant. Veuillez régénérer le QR Code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🔧 Setup2FA: Verifying setup with:');
      console.log('- tempToken:', tempToken ? 'exists' : 'missing');
      console.log('- code:', code);
      console.log('- isSetup: true');
      
      const result = await verify2FA(tempToken, code, true); // isSetup = true
      console.log('✅ Setup2FA: Verification successful:', result);
      onSuccess(result);
    } catch (error) {
      console.error('❌ Setup2FA: Verification failed:', error);
      setError(error.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Mêmes particules et animations */}
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

      <div className="medical-crosses">
        <div className="medical-cross"></div>
        <div className="medical-cross"></div>
        <div className="medical-cross"></div>
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
          <h1 className="login-title">Configuration 2FA</h1>
          <p className="login-subtitle">
            🔧 Configurez votre authentification à deux facteurs 🔧
          </p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Erreur:</strong> {error}
            {error.includes('Token temporaire manquant') && (
              <button 
                onClick={() => {
                  setStep('generate');
                  setError('');
                }}
                style={{ 
                  marginLeft: '10px', 
                  padding: '5px 10px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Régénérer
              </button>
            )}
          </div>
        )}

        {loading && step === 'generate' ? (
          <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Génération du QR Code...</p>
          </div>
        ) : step === 'verify' && qrCode ? (
          <div className="setup-2fa-content">
            <div className="qr-code-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>1. Scannez ce QR Code</h3>
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
                <img src={qrCode} alt="QR Code 2FA" style={{ maxWidth: '200px', height: 'auto' }} />
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Utilisez Google Authenticator, Authy ou une autre app compatible
              </p>
              {secret && (
                <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                  <small style={{ color: '#6b7280' }}>
                    Clé manuelle : <code style={{ backgroundColor: '#e5e7eb', padding: '2px 4px', borderRadius: '2px' }}>{secret}</code>
                  </small>
                </div>
              )}
            </div>

            <form className="login-form" onSubmit={handleVerifySetup}>
              <div className="form-group">
                <label className="form-label" htmlFor="setup-code">
                  2. Entrez le code généré (6 chiffres)
                </label>
                <input
                  id="setup-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="form-input"
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={onBack}
                  className="login-button"
                  style={{ backgroundColor: '#6b7280', flex: 1 }}
                >
                  Ignorer pour maintenant
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6 || !tempToken}
                  className="login-button"
                  style={{ flex: 1 }}
                >
                  <div className="button-content">
                    {loading && <div className="loading-spinner"></div>}
                    <span>{loading ? 'Configuration...' : 'Terminer'}</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="medical-footer">
          <span>🛡️ Sécurité renforcée - Configuration 2FA</span>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
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
      
      console.log('✅ Login form: Login response', result);

      // Si 2FA requis
      if (result.requires2FA) {
        console.log('🔐 2FA required');
        setRequires2FA(true);
        setTempToken(result.tempToken);
        setUserEmail(formData.email);
        return;
      }

      // Connexion réussie sans 2FA
      handleSuccessfulLogin(result);
      
    } catch (err) {
      console.error('❌ Login form: Login failed:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulLogin = (result) => {
    console.log('✅ Login successful', result);
    
    // Vérifier que le token est bien stocké
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Login form: Post-login check');
    console.log('- Token stored:', !!storedToken);
    console.log('- User stored:', !!storedUser);
    
    if (!storedToken || !storedUser) {
      throw new Error('Erreur de stockage des données de connexion');
    }
    
    // Vérifier si c'est un médecin qui n'a pas encore configuré 2FA
    if (result.user.role === 'medecin' && !result.user.twofa_enabled) {
      console.log('🔧 Doctor needs to setup 2FA');
      setShowSetup2FA(true);
      setUserEmail(result.user.email);
      return;
    }
    
    // Redirection basée sur le rôle
    redirectUser(result.user.role);
  };

  const handle2FASuccess = (result) => {
    console.log('✅ 2FA verification successful');
    setRequires2FA(false);
    setTempToken('');
    handleSuccessfulLogin(result);
  };

  const handle2FACancel = () => {
    console.log('❌ 2FA cancelled');
    setRequires2FA(false);
    setTempToken('');
    setUserEmail('');
  };

  const handleSetup2FAComplete = (result) => {
    console.log('✅ 2FA setup completed');
    setShowSetup2FA(false);
    handleSuccessfulLogin(result);
  };

  const handleSetup2FACancel = () => {
    console.log('❌ 2FA setup cancelled');
    setShowSetup2FA(false);
    // Permettre l'accès sans 2FA pour cette fois
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    redirectUser(user.role);
  };

  const redirectUser = (role) => {
    if (role === 'admin') {
      console.log('🔄 Redirecting to admin dashboard');
      navigate('/admin');
    } else if (role === 'medecin') {
      console.log('🔄 Redirecting to doctor dashboard');
      navigate('/doctor');
    } else if (role === 'secretaire') {
      console.log('🔄 Redirecting to secretary dashboard');
      navigate('/secretary');
    } else {
      console.log('🔄 Redirecting to patient dashboard');
      navigate('/patient');
    }
  };

  // Afficher le composant de vérification 2FA
  if (requires2FA) {
    return (
      <Verify2FA
        tempToken={tempToken}
        onSuccess={handle2FASuccess}
        onBack={handle2FACancel}
      />
    );
  }

  // Afficher le composant de configuration 2FA
  if (showSetup2FA) {
    return (
      <Setup2FA
        email={userEmail}
        onSuccess={handleSetup2FAComplete}
        onBack={handleSetup2FACancel}
      />
    );
  }

  // Formulaire de connexion principal
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
          <div className="security-notice" style={{ marginTop: '0.5rem' }}>
            <small style={{ color: '#10b981' }}>🔒 Sécurisé avec authentification 2FA pour les médecins</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;