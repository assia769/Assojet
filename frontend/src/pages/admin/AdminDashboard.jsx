// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import AuthDebug from '../../components/AuthDebug';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching dashboard stats...');
        console.log('👤 Current user:', user);
        console.log('🔑 Token exists:', !!localStorage.getItem('authToken'));
        
        const data = await adminService.getDashboardStats();
        setStats(data);
        console.log('✅ Stats fetched successfully:', data);
      } catch (err) {
        console.error('❌ Error fetching stats:', err);
        setError(err.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    // Vérifier que l'utilisateur est admin avant de charger
    if (user && isAdmin()) {
      fetchStats();
    } else {
      console.log('⚠️ User is not admin or not authenticated');
      setLoading(false);
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Dashboard Admin</h2>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Dashboard Admin</h2>
        <p>Vous devez être connecté pour accéder à cette page.</p>
        <AuthDebug />
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Dashboard Admin</h2>
        <p>Accès refusé. Vous devez être administrateur.</p>
        <AuthDebug />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Dashboard Admin</h2>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <strong>Erreur:</strong> {error}
        </div>
        <AuthDebug />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard Admin</h2>
      
      {/* Informations utilisateur */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>👤 Utilisateur connecté:</h3>
        <p><strong>Nom:</strong> {user.nom} {user.prenom}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rôle:</strong> {user.role}</p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div>
          <h3>📊 Statistiques</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            {/* Statistiques utilisateurs */}
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4>👥 Utilisateurs</h4>
              {stats.userStats && stats.userStats.length > 0 ? (
                stats.userStats.map(stat => (
                  <div key={stat.role}>
                    <strong>{stat.role}:</strong> {stat.total} 
                    (actifs 24h: {stat.actifs_24h}, 7j: {stat.actifs_7j})
                  </div>
                ))
              ) : (
                <p>Aucune donnée utilisateur</p>
              )}
            </div>

            {/* Statistiques consultations */}
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4>🏥 Consultations</h4>
              <p><strong>Total:</strong> {stats.consultationStats.total_consultations}</p>
              <p><strong>Aujourd'hui:</strong> {stats.consultationStats.consultations_aujourdhui}</p>
              <p><strong>30 derniers jours:</strong> {stats.consultationStats.consultations_30j}</p>
            </div>

            {/* Statistiques financières */}
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4>💰 Finances</h4>
              <p><strong>Revenus total:</strong> {stats.financialStats.revenus_total}€</p>
              <p><strong>Aujourd'hui:</strong> {stats.financialStats.revenus_aujourdhui}€</p>
              <p><strong>30 derniers jours:</strong> {stats.financialStats.revenus_30j}€</p>
            </div>

          </div>
        </div>
      )}

      {/* Debug (à supprimer en production) */}
      <AuthDebug />
    </div>
  );
};

export default AdminDashboard;