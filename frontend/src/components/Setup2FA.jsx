import React, { useState, useEffect } from 'react';

const Setup2FA = ({ email, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Générer le QR Code au montage du composant
  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/generate-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
      } else {
        setError(data.message || 'Erreur lors de la génération du QR Code');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndComplete = async () => {
    if (!verificationCode) {
      setError('Veuillez entrer le code de vérification');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Créer un token temporaire factice pour la configuration initiale
      const tempToken = localStorage.getItem('authToken') || 'setup-token';
      
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempToken,
          code: verificationCode,
          isSetup: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(3); // Afficher les codes de backup
      } else {
        setError(data.message || 'Code de vérification invalide');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    const content = `Codes de backup pour l'authentification 2FA
Cabinet Médical Premium
Email: ${email}
Date: ${new Date().toLocaleDateString()}

Codes de backup (à utiliser une seule fois chacun):
${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

⚠️ IMPORTANT:
- Conservez ces codes dans un lieu sûr
- Chaque code ne peut être utilisé qu'une seule fois
- Ces codes vous permettront d'accéder à votre compte si vous perdez votre appareil d'authentification`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-2fa-${email}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading && step === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Génération du QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuration 2FA</h1>
          <p className="text-gray-600">Sécurisez votre compte médical avec l'authentification à deux facteurs</p>
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

        {/* Step 1: QR Code */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Étape 1: Scannez le QR Code
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <p className="text-sm text-gray-600 mb-4">
                1. Ouvrez Google Authenticator sur votre téléphone<br/>
                2. Appuyez sur "+" pour ajouter un compte<br/>
                3. Scannez ce QR Code
              </p>
              
              {qrCode && (
                <div className="flex justify-center mb-4">
                  <img src={qrCode} alt="QR Code 2FA" className="border-2 border-gray-200 rounded-lg" />
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Ou entrez manuellement ce code:</p>
                <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                  {secret}
                </div>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  📋 Copier le code
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 transform hover:scale-105"
            >
              J'ai scanné le QR Code →
            </button>
          </div>
        )}

        {/* Step 2: Verification */}
        {step === 2 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Étape 2: Vérification
            </h2>
            
            <p className="text-gray-600 mb-6">
              Entrez le code à 6 chiffres généré par Google Authenticator
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-xl py-4 px-6 w-48 focus:border-blue-500 focus:outline-none"
                maxLength={6}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl transition duration-200"
              >
                ← Retour
              </button>
              <button
                onClick={verifyAndComplete}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 transform hover:scale-105 disabled:transform-none"
              >
                {loading ? 'Vérification...' : 'Vérifier →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                🎉 2FA Activé avec Succès!
              </h2>
              <p className="text-gray-600 mb-6">
                Voici vos codes de backup. Conservez-les précieusement!
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-4">⚠️ Codes de Backup</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-xs text-yellow-700">
                Chaque code ne peut être utilisé qu'une seule fois. Conservez-les dans un lieu sûr!
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={downloadBackupCodes}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200"
              >
                📥 Télécharger les Codes
              </button>
              <button
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200"
              >
                📋 Copier les Codes
              </button>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 transform hover:scale-105"
            >
              Terminer la Configuration ✨
            </button>
          </div>
        )}

        {/* Cancel button */}
        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Annuler la configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setup2FA;