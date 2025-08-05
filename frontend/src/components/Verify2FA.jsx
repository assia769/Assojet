import React, { useState, useEffect } from 'react';

const Verify2FA = ({ tempToken, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes en secondes
  const [showBackupCode, setShowBackupCode] = useState(false);

  // Compte à rebours pour l'expiration du token
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Session expirée. Veuillez vous reconnecter.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!code) {
      setError('Veuillez entrer le code de vérification');
      return;
    }

    if (code.length < 6) {
      setError('Le code doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempToken,
          code: code.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Stocker le token final
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        onSuccess(data);
      } else {
        setError(data.message || 'Code de vérification invalide');
        setCode(''); // Vider le champ en cas d'erreur
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    // Pour les codes normaux (6 chiffres) ou codes de backup (8 caractères alphanumériques)
    if (showBackupCode) {
      setCode(value.toUpperCase().slice(0, 8));
    } else {
      setCode(value.replace(/\D/g, '').slice(0, 6));
    }
    setError('');
  };

  if (timeLeft <= 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expirée</h2>
            <p className="text-gray-600 mb-6">
              Votre session de vérification 2FA a expiré. Veuillez vous reconnecter.
            </p>
            <button
              onClick={onCancel}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200"
            >
              Retour à la Connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Particules animées */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-4 h-4 bg-blue-200 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-indigo-200 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-purple-200 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-32 w-5 h-5 bg-blue-300 rounded-full animate-bounce delay-1000"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentification 2FA</h1>
          <p className="text-gray-600">
            {showBackupCode 
              ? 'Entrez un code de backup' 
              : 'Entrez le code à 6 chiffres de votre authenticator'
            }
          </p>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className={`text-center p-3 rounded-lg ${timeLeft < 120 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm font-medium ${timeLeft < 120 ? 'text-red-700' : 'text-blue-700'}`}>
              ⏱️ Session expire dans: {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {showBackupCode ? 'Code de Backup' : 'Code Authenticator'}
          </label>
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            placeholder={showBackupCode ? 'ABC12DEF' : '123456'}
            className={`w-full text-center text-2xl font-mono tracking-widest border-2 rounded-xl py-4 px-6 focus:outline-none transition-colors ${
              error 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            maxLength={showBackupCode ? 8 : 6}
            autoComplete="off"
            autoFocus
          />
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || !code || (showBackupCode ? code.length < 8 : code.length < 6)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg disabled:shadow-none"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Vérification...
            </div>
          ) : (
            <>
              <span>Vérifier</span>
              <span className="ml-2">🔐</span>
            </>
          )}
        </button>

        {/* Toggle Backup Code */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setShowBackupCode(!showBackupCode);
              setCode('');
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            {showBackupCode 
              ? '← Utiliser un code authenticator' 
              : 'Utiliser un code de backup →'
            }
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">💡 Aide</h3>
          {showBackupCode ? (
            <p className="text-xs text-gray-600">
              Les codes de backup sont des codes à 8 caractères que vous avez sauvegardés lors de la configuration du 2FA. 
              Chaque code ne peut être utilisé qu'une seule fois.
            </p>
          ) : (
            <p className="text-xs text-gray-600">
              Ouvrez Google Authenticator sur votre téléphone et entrez le code à 6 chiffres correspondant à "Cabinet Médical".
              Le code change toutes les 30 secondes.
            </p>
          )}
        </div>

        {/* Cancel Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify2FA;