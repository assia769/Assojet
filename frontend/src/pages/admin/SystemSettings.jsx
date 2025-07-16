// frontend/src/pages/admin/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import '../../styles/components/admin.css';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    maxUsers: 1000,
    emailNotifications: true,
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSystemSettings(settings);
      setMessage('Paramètres sauvegardés avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Paramètres Système</h1>
      </div>

      {message && (
        <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h3>Configuration Générale</h3>
          
          <div className="form-group">
            <label htmlFor="siteName">Nom du site</label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="siteDescription">Description</label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="maxUsers">Nombre maximum d'utilisateurs</label>
            <input
              type="number"
              id="maxUsers"
              name="maxUsers"
              value={settings.maxUsers}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Notifications par email
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Maintenance</h3>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Mode maintenance
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Sauvegardes</h3>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="autoBackup"
                checked={settings.autoBackup}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Sauvegarde automatique
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="backupFrequency">Fréquence de sauvegarde</label>
            <select
              id="backupFrequency"
              name="backupFrequency"
              value={settings.backupFrequency}
              onChange={handleChange}
              disabled={!settings.autoBackup}
            >
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="save-btn"
          disabled={saving}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
};

export default SystemSettings;