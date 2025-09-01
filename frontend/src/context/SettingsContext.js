// frontend/src/contexts/SettingsContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react';
import { adminService } from '../services/adminService';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: 'Cabinet Médical',
    dark_mode: false,
    maintenance_mode: false,
    font_family: 'Inter',
    font_size: '16px',
    primary_color: '#3b82f6'
  });
  const [loading, setLoading] = useState(true);

  // Fonction pour appliquer les paramètres
  const applySettings = useCallback(
    (customSettings = settings) => {
      const root = document.documentElement;

      // Mode sombre
      if (customSettings.dark_mode === true || customSettings.dark_mode === 'true') {
        document.body.classList.add('dark');
        root.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
        root.classList.remove('dark');
      }

      // CSS variables
      root.style.setProperty('--font-family', customSettings.font_family);
      root.style.setProperty('--font-size', customSettings.font_size);
      root.style.setProperty('--primary-color', customSettings.primary_color);

      // RGB color extraction
      const hex = customSettings.primary_color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);

      // Title & font
      document.title = customSettings.site_name;
      document.body.style.fontFamily = customSettings.font_family;
      document.body.style.fontSize = customSettings.font_size;
    },
    [settings]
  );

  // Charger les paramètres depuis la BDD au montage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await adminService.getSystemSettings();

        const settingsObj = {};
        Object.keys(data).forEach((key) => {
          settingsObj[key] = data[key].value;
        });

        setSettings((prev) => ({ ...prev, ...settingsObj }));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Appliquer les paramètres à chaque mise à jour
  useEffect(() => {
    applySettings();
  }, [applySettings]);

  // Mettre à jour BDD + état local
  const updateSettings = async (newSettings) => {
    try {
      await adminService.updateSystemSettings(newSettings);
      setSettings((prev) => ({ ...prev, ...newSettings }));
      applySettings(newSettings);
      return { success: true, message: 'Paramètres sauvegardés avec succès' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde' };
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    applySettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
