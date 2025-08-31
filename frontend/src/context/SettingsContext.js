// frontend/src/contexts/SettingsContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  // Fonction pour appliquer les paramètres (mémoïsée pour éviter ESLint warning)
  const applySettings = useCallback(() => {
    const root = document.documentElement;

    // Appliquer le thème sombre/clair
    if (settings.dark_mode === true || settings.dark_mode === 'true') {
      document.body.classList.add('dark');
      root.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      root.classList.remove('dark');
    }

    // Appliquer les variables CSS globales
    root.style.setProperty('--font-family', settings.font_family);
    root.style.setProperty('--font-size', settings.font_size);
    root.style.setProperty('--primary-color', settings.primary_color);

    // Extraire les valeurs RGB de la couleur primaire pour Tailwind
    const hex = settings.primary_color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);

    // Changer le titre du site
    document.title = settings.site_name;

    // Appliquer la police à tout le body
    document.body.style.fontFamily = settings.font_family;
    document.body.style.fontSize = settings.font_size;
  }, [settings]);

  // Charger les paramètres au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await adminService.getSystemSettings();

        // Convertir les données de la BDD en objet settings
        const settingsObj = {};
        Object.keys(data).forEach(key => {
          settingsObj[key] = data[key].value;
        });

        setSettings(prev => ({ ...prev, ...settingsObj }));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Appliquer les paramètres chaque fois qu'ils changent
  useEffect(() => {
    applySettings();
  }, [applySettings]);

  // Mettre à jour les paramètres côté BDD + état local
  const updateSettings = async (newSettings) => {
    try {
      await adminService.updateSystemSettings(newSettings);
      setSettings(newSettings);
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
