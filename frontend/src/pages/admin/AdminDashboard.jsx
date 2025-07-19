
// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import AuthDebug from '../../components/AuthDebug';
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

  if (loading) return <div style={{ padding: '20px' }}><h2>Dashboard Admin</h2><p>Chargement...</p></div>;
  if (!user) return <div style={{ padding: '20px' }}><h2>Dashboard Admin</h2><p>Veuillez vous connecter.</p><AuthDebug /></div>;
  if (!isAdmin()) return <div style={{ padding: '20px' }}><h2>Dashboard Admin</h2><p>Accès refusé.</p><AuthDebug /></div>;
  if (error) return <div style={{ padding: '20px' }}><h2>Dashboard Admin</h2><div style={{ color: 'red' }}>{error}</div><AuthDebug /></div>;
  if (stats) {
    console.log('📦 Stats:', stats); // <-- ici dans le composant
  };
 console.log('📦 userStats:', stats.userStats);
console.log('📅 consultationStats:', stats.consultationStats);
console.log('💶 financialStats:', stats.financialStats);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
 
  const userRoleData = stats.userStats?.map(stat => ({ role: stat.role, total: stat.total })) || [];
  const userActiveData = stats.userStats?.map(stat => ({ role: stat.role, actifs: stat.actifs_7j })) || [];

  const consultationData = stats.consultationStats?.daily_stats || [];
  const revenusData = stats.financialStats?.daily_revenus || [];
 




  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard Admin</h2>

      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>👤 Utilisateur connecté:</h3>
        <p><strong>Nom:</strong> {user.nom} {user.prenom}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rôle:</strong> {user.role}</p>
      </div>

      {stats && (
        <>
          <h3>📊 Statistiques</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div>
              <h4>👥 Utilisateurs par rôle</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userRoleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* <div>
              <h4>👤 Actifs sur 7j</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={userActiveData} dataKey="actifs" nameKey="role" outerRadius={80}>
                    {userActiveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div> */}

            <div>
              <h4>📅 Consultations (30j)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={consultationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4>💶 Revenus (30j)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenusData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="montant" stroke="#ffc658" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <AuthDebug />
    </div>
  );
};

export default AdminDashboard;
