import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Manage2FA = () => {
  const { user, disable2FA, generate2FA, refreshUser } = useAuth();
  const [showDisable, setShowDisable] = useState(false);
  const [showEnable, setShowEnable] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1);

  const handleDisable2FA = async () => {
    if (!password) {
      setError('Mot de passe requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await disable2FA(password);
      setSuccess('2FA désactivé avec succès');
      setShowDisable(false);
      setPassword('');
      await refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await generate2FA(user.email);
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setBackupCodes(result.backupCodes);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Code à 6 chiffres requis');
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
          tempToken: localStorage.getItem('authToken'),
          code: verificationCode,
          isSetup: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
        setSuccess('2FA activé avec succès!');
        await refreshUser();
      } else {
        setError(data.message || 'Code invalide');
      }
    } catch (err) {
      setError('Erreur de vérification');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copié!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const downloadBackupCodes = () => {
    const content = `Codes de backup 2FA - ${user.email}
Date: ${new Date().toLocaleDateString()}

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

⚠️ Conservez ces codes en sécurité!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-2fa.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const resetState = () => {
    setShowDisable(false);
    setShowEnable(false);
    setPassword('');
    setError('');
    setSuccess('');
    setQrCode('');
    setSecret('');
    setBackupCodes([]);
    setVerificationCode('');
    setStep(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Authentification 2FA
          </h2>
          <p className="text-gray-600">Gérez votre authentification à deux facteurs</p>
        </div>
        
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          user?.twofa_enabled 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {user?.twofa_enabled ? '🔒 Activé' : '⚠️ Désactivé'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* État principal */}
      {!showDisable && !showEnable && (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg border-2 ${
            user?.twofa_enabled 
              ? 'border-green-200 bg-green-50' 
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {user?.twofa_enabled ? 'Sécurité Renforcée' : 'Sécurisation Recommandée'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {user?.twofa_enabled 
                    ? 'Votre compte est protégé par l\'authentification à deux facteurs. Vous devrez utiliser votre téléphone pour vous connecter.'
                    : 'Activez le 2FA pour sécuriser votre compte médical avec Google Authenticator.'
                  }
                </p>
                
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">
                    {user?.twofa_enabled 
                      ? 'Protection active contre les accès non autorisés'
                      : 'Recommandé pour tous les comptes médicaux'
                    }
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => user?.twofa_enabled ? setShowDisable(true) : setShowEnable(true)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  user?.twofa_enabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {user?.twofa_enabled ? 'Désactiver 2FA' : 'Activer 2FA'}
              </button>
            </div>
          </div>

          {/* Informations sur 2FA */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📱 Comment ça marche</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Installez Google Authenticator</li>
                <li>• Scannez le QR code</li>
                <li>• Entrez le code à chaque connexion</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">🔒 Avantages</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Protection contre le piratage</li>
                <li>• Conformité sécurité médicale</li>
                <li>• Codes de backup inclus</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Désactivation 2FA */}
      {showDisable && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Désactiver 2FA</h3>
            <p className="text-red-700 mb-4">
              Attention: Désactiver le 2FA réduira la sécurité de votre compte médical.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmez avec votre mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Votre mot de passe"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDisable2FA}
                disabled={loading || !password}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-semibold"
              >
                {loading ? 'Désactivation...' : 'Confirmer la désactivation'}
              </button>
              <button
                onClick={resetState}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activation 2FA */}
      {showEnable && (
        <div className="space-y-6">
          {step === 1 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Activation du 2FA</h3>
              <p className="text-gray-600 mb-6">
                Nous allons configurer l'authentification à deux facteurs pour votre compte.
              </p>
              
              <button
                onClick={handleEnable2FA}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {loading ? 'Génération...' : 'Commencer la configuration'}
              </button>
              
              <button
                onClick={resetState}
                className="ml-3 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
              >
                Annuler
              </button>
            </div>
          )}

          {step === 2 && qrCode && (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Scannez le QR Code</h3>
              
              <div className="bg-gray-50 p-6 rounded-xl mb-4 inline-block">
                <img src={qrCode} alt="QR Code 2FA" className="mx-auto mb-4" />
                
                <div className="text-sm text-gray-600 mb-2">Code manuel:</div>
                <div className="bg-white p-2 rounded border font-mono text-xs break-all mb-2">
                  {secret}
                </div>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  📋 Copier
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification (6 chiffres)
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-xl font-mono tracking-wider border-2 border-gray-300 rounded-lg py-3 px-4 w-48 focus:border-blue-500 focus:outline-none"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleVerifySetup}
                  disabled={loading || verificationCode.length !== 6}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {loading ? 'Vérification...' : 'Vérifier et Activer'}
                </button>
                <button
                  onClick={resetState}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold mb-4">🎉 2FA Activé!</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-3">Codes de Backup</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="bg-white p-2 rounded border font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={downloadBackupCodes}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    📥 Télécharger
                  </button>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    📋 Copier
                  </button>
                </div>
              </div>

              <button
                onClick={resetState}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Terminer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Manage2FA;