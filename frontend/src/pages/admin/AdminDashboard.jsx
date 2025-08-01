// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import AuthDebug from '../../components/AuthDebug';
import '../../styles/components/dash.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie,
  Cell, LineChart, Line, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';

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
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin()) fetchStats();
    else setLoading(false);
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <h2>  Welcome Admin</h2>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Dashboard Admin</h2>
          <p>Veuillez vous connecter pour accéder au dashboard.</p>
          <div className="auth-debug">
            <AuthDebug />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Dashboard Admin</h2>
          <p>Accès refusé. Vous n'avez pas les permissions nécessaires.</p>
          <div className="auth-debug">
            <AuthDebug />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <h2>Dashboard Admin</h2>
          <div className="error-message">{error}</div>
          <div className="auth-debug">
            <AuthDebug />
          </div>
        </div>
      </div>
    );
  }

  if (stats) {
    console.log('📦 Stats:', stats);
    console.log('📦 userStats:', stats.userStats);
    console.log('📅 consultationStats:', stats.consultationStats);
    console.log('💶 financialStats:', stats.financialStats);
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
 
  const userRoleData = stats.userStats?.map(stat => ({ role: stat.role, total: stat.total })) || [];
  const userActiveData = stats.userStats?.map(stat => ({ role: stat.role, actifs: stat.actifs_7j })) || [];

  const consultationData = stats.consultationStats?.daily_stats || [];
  const revenusData = stats.financialStats?.daily_revenus || [];

  return (
    <div className="admin-dashboard">
      {/* Header avec gradient */}
      <div className="dashboard-header">
        <h2>✨ Bienvenue Admin ✨</h2>
      </div>

      <div className="dashboard-content">
        {/* Informations utilisateur connecté */}
        <div className="user-info-card">
          <h3>👤 Utilisateur connecté</h3>
          <div className="user-info-grid">
            <div className="user-info-item">
              <strong>Nom complet</strong>
              <span>{user.nom} {user.prenom}</span>
            </div>
            <div className="user-info-item">
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>
            <div className="user-info-item">
              <strong>Rôle</strong>
              <span>{user.role}</span>
            </div>
          </div>
        </div>

        {stats && (
          <div className="stats-section">
            <h3 className="stats-title">📊 Statistiques du système</h3>
            <div className="charts-grid">
              {/* Graphique des utilisateurs par rôle */}
              <div className="chart-card users-card">
                <h4>👥 Utilisateurs par rôle</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={userRoleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="role" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="#6366f1" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique des consultations */}
              <div className="chart-card consultations-card">
                <h4>📅 Consultations (30 derniers jours)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={consultationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique des revenus */}
              <div className="chart-card revenue-card">
                <h4>💶 Revenus (30 derniers jours)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenusData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value) => [`${value}€`, 'Montant']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="montant" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Debug auth en bas
        <div className="auth-debug">
          <AuthDebug />
        </div> */}
      </div>
    </div>
  );
};

export default AdminDashboard;