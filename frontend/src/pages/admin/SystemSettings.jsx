import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Type, 
  AlertTriangle, 
  Globe, 
  Save,
  Moon,
  Sun
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const SystemSettings = () => {
  const { settings: contextSettings, updateSettings: updateContextSettings, loading: contextLoading } = useSettings();
  const [localSettings, setLocalSettings] = useState(contextSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Synchroniser les paramètres locaux avec le contexte
  useEffect(() => {
    setLocalSettings(contextSettings);
  }, [contextSettings]);

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const result = await updateContextSettings(localSettings);
      setMessage(result.message);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Appliquer les changements en temps réel pour la prévisualisation
  useEffect(() => {
    const root = document.documentElement;
    
    // Appliquer temporairement les changements pour la prévisualisation
    root.style.setProperty('--preview-font-family', localSettings.font_family);
    root.style.setProperty('--preview-font-size', localSettings.font_size);
    root.style.setProperty('--preview-primary-color', localSettings.primary_color);
  }, [localSettings]);

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' }
  ];

  const fontSizeOptions = [
    { value: '14px', label: 'Petit (14px)' },
    { value: '16px', label: 'Normal (16px)' },
    { value: '18px', label: 'Grand (18px)' },
    { value: '20px', label: 'Très grand (20px)' },
    { value: '22px', label: 'Extra grand (22px)' }
  ];

  if (contextLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="mr-3" />
          Paramètres Système
        </h1>
        <p className="text-gray-600 mt-2">
          Configurez l'apparence et le comportement du système
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.includes('Erreur') 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration générale */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="mr-2" />
            Configuration Générale
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Site
              </label>
              <input
                type="text"
                value={localSettings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de votre site"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="text-orange-500 mr-2" />
                <div>
                  <p className="font-medium">Mode Maintenance</p>
                  <p className="text-sm text-gray-600">
                    Seuls les administrateurs peuvent accéder au site
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.maintenance_mode === true || localSettings.maintenance_mode === 'true'}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Apparence */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Palette className="mr-2" />
            Apparence
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <div className="flex items-center">
                {(localSettings.dark_mode === true || localSettings.dark_mode === 'true') ? 
                  <Moon className="mr-2" /> : <Sun className="mr-2" />}
                <div>
                  <p className="font-medium">Mode Sombre</p>
                  <p className="text-sm text-gray-600">
                    Interface sombre pour réduire la fatigue oculaire
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.dark_mode === true || localSettings.dark_mode === 'true'}
                  onChange={(e) => handleChange('dark_mode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur Primaire
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={localSettings.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={localSettings.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#3b82f6"
                />
              </div>
              <div className="mt-2 flex space-x-2">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleChange('primary_color', color)}
                    className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Typographie */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Type className="mr-2" />
            Typographie
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police de caractères
              </label>
              <select
                value={localSettings.font_family}
                onChange={(e) => handleChange('font_family', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille de police
              </label>
              <select
                value={localSettings.font_size}
                onChange={(e) => handleChange('font_size', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fontSizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Aperçu du texte :</p>
            <div 
              style={{ 
                fontFamily: localSettings.font_family, 
                fontSize: localSettings.font_size,
                color: localSettings.primary_color 
              }}
            >
              <p className="font-medium mb-2">
                Cabinet Médical - Titre Principal
              </p>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <button 
                className="mt-2 px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: localSettings.primary_color }}
              >
                Bouton d'exemple
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => setLocalSettings(contextSettings)}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;