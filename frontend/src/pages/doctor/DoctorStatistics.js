import React, { useState, useEffect } from 'react';
import DoctorService from '../../services/doctorService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#45B39D'];

const DoctorStatistics = () => {
  const [statistics, setStatistics] = useState({});
  const [consultationsStats, setConsultationsStats] = useState([]);
  const [pathologiesStats, setPathologiesStats] = useState([]);
  const [patientsStats, setPatientsStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAllStatistics();
  }, [selectedPeriod, dateRange]);

  const loadAllStatistics = async () => {
    try {
      setLoading(true);
      const [statsData, consultationsData, pathologiesData, patientsData] = await Promise.all([
        DoctorService.getStatistics(selectedPeriod),
        DoctorService.getConsultationsStats(dateRange.start, dateRange.end),
        DoctorService.getPathologiesStats(),
        DoctorService.getPatientsStats()
      ]);

      setStatistics(statsData);
      setConsultationsStats(consultationsData);
      setPathologiesStats(pathologiesData);
      setPatientsStats(patientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };
 useEffect(() => {
  if (process.env.NODE_ENV === 'development' && consultationsStats.length === 0) {
    setConsultationsStats([
      { date: '2025-08-01', count: 2 },
      { date: '2025-08-02', count: 3 },
      { date: '2025-08-03', count: 1 }
    ]);
  }

  if (process.env.NODE_ENV === 'development' && pathologiesStats.length === 0) {
    setPathologiesStats([
      { nom: 'Migraine', count: 5 },
      { nom: 'Fièvre', count: 3 },
      { nom: 'Rhume', count: 2 }
    ]);
  }
}, [consultationsStats.length, pathologiesStats.length]);

  if (loading) return <div className="loading">Chargement...</div>;
{process.env.NODE_ENV === 'development' && (
  <pre className="text-xs bg-gray-100 p-2 rounded">
    {JSON.stringify({ pathologiesStats }, null, 2)}
  </pre>
)}

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistiques Médicales</h2>
        <select 
          className="border px-2 py-1 rounded"
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded-2xl">
          <h3 className="text-lg font-semibold">Consultations</h3>
          <p className="text-2xl">{statistics.totalConsultations || 0}</p>
          <p className="text-sm text-gray-500">
            {statistics.consultationsChange >= 0 ? '+' : ''}{statistics.consultationsChange}% vs période précédente
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded-2xl">
          <h3 className="text-lg font-semibold">Nouveaux Patients</h3>
          <p className="text-2xl">{statistics.nouveauxPatients || 0}</p>
          <p className="text-sm text-gray-500">
            {statistics.patientsChange >= 0 ? '+' : ''}{statistics.patientsChange}%
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded-2xl">
          <h3 className="text-lg font-semibold">Prescriptions</h3>
          <p className="text-2xl">{statistics.totalPrescriptions || 0}</p>
          <p className="text-sm text-gray-500">
            {statistics.prescriptionsChange >= 0 ? '+' : ''}{statistics.prescriptionsChange}%
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded-2xl">
          <h3 className="text-lg font-semibold">Taux de présence</h3>
          <p className="text-2xl">{statistics.tauxPresence || 0}%</p>
          <p className="text-sm text-gray-500">Rendez-vous honorés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow rounded-2xl">
          <h4 className="font-semibold mb-2">Évolution des Consultations</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={consultationsStats}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow rounded-2xl">
          <h4 className="font-semibold mb-2">Pathologies Fréquentes</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pathologiesStats}
                dataKey="count"
                nameKey="nom"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                label
              >
                {pathologiesStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow rounded-2xl">
          <h4 className="font-semibold mb-4">Répartition des Patients</h4>
          <ul className="space-y-1">
            <li>Patients actifs: <strong>{patientsStats.actifs || 0}</strong></li>
            <li>Nouveaux ce mois: <strong>{patientsStats.nouveauxCeMois || 0}</strong></li>
            <li>Âge moyen: <strong>{patientsStats.ageMoyen || 0}</strong> ans</li>
            <li>Hommes: <strong>{patientsStats.hommes || 0}</strong> ({patientsStats.pourcentageHommes || 0}%)</li>
            <li>Femmes: <strong>{patientsStats.femmes || 0}</strong> ({patientsStats.pourcentageFemmes || 0}%)</li>
          </ul>
        </div>

        <div className="bg-white p-4 shadow rounded-2xl">
          <h4 className="font-semibold mb-4">Indicateurs de Performance</h4>
          <ul className="space-y-1">
            <li>Durée moyenne consultation: <strong>{statistics.dureeMoyenneConsultation || 0} min</strong></li>
            <li>Revenus du mois: <strong>{statistics.revenusMois || 0} MAD</strong></li>
            <li>Satisfaction patients: <strong>{statistics.satisfactionMoyenne || 0}/5</strong></li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded-2xl">
        <h4 className="font-semibold mb-2">Filtrer par période personnalisée</h4>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="border p-1 rounded"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          />
          <span>à</span>
          <input
            type="date"
            className="border p-1 rounded"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          />
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700"
            onClick={loadAllStatistics}>
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorStatistics;
