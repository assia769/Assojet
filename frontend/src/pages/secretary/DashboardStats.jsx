// frontend/src/components/secretary/DashboardStats.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { secretaryService } from '../../services/secretaryService';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingInvoices: 0,
    totalPatients: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await secretaryService.getDashboardStats();
      console.log('Données récupérées:', data);  // Ajoutez cette ligne

      setStats(data || {
        todayAppointments: 0,
        pendingInvoices: 0,
        totalPatients: 0,
        upcomingAppointments: []
      });
    } catch (error) {
      console.error('Erreur fetchDashboardStats:', error);
      
      // Gestion spécifique des erreurs
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError('Accès non autorisé.');
      } else if (error.message === 'Unexpected token \'<\'') {
        setError('Erreur de configuration du serveur. Contactez l\'administrateur.');
      } else {
        setError(error.response?.data?.message || error.message || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">Erreur lors du chargement des statistiques: {error}</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const statsCards = [
    {
      title: "RDV aujourd'hui",
      value: stats.todayAppointments || 0,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
      description: "Rendez-vous prévus aujourd'hui"
    },
    {
      title: 'Factures en attente',
      value: stats.pendingInvoices || 0,
      icon: FileText,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-600',
      description: 'Factures non payées',
      alert: (stats.pendingInvoices || 0) > 10
    },
    {
      title: 'Total patients',
      value: stats.totalPatients || 0,
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      description: 'Patients enregistrés'
    },
    {
      title: 'Prochains RDV',
      value: (stats.upcomingAppointments && stats.upcomingAppointments.length) || 0,
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-600',
      description: 'Rendez-vous à venir'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Cartes statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600 truncate">
                      {card.title}
                    </p>
                    {card.alert && (
                      <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                  <div className="mt-2">
                    <p className={`text-3xl font-bold ${card.valueColor}`}>
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div className={`${card.bgColor} p-3 rounded-full ml-4`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
            
            {/* Indicateur de progression pour certaines cartes */}
            {card.title === "RDV aujourd'hui" && (
              <div className="px-6 pb-4">
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>Mise à jour en temps réel</span>
                </div>
              </div>
            )}

            {card.alert && (
              <div className="px-6 pb-4">
                <div className="flex items-center text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>Attention requise</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Résumé rapide des prochains RDV */}
      {stats.upcomingAppointments && stats.upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Aperçu des prochains rendez-vous
            </h3>
            <span className="text-sm text-gray-500">
              {stats.upcomingAppointments.length} RDV à venir
            </span>
          </div>
          
          <div className="space-y-3">
            {stats.upcomingAppointments.slice(0, 3).map((appointment, index) => (
              <div key={appointment.id_r || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patient_nom} {appointment.patient_prenom}
                    </p>
                    <p className="text-xs text-gray-500">
                      avec Dr. {appointment.medecin_nom} {appointment.medecin_prenom}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(appointment.date_rend).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appointment.heure}
                  </p>
                </div>
              </div>
            ))}
            
            {stats.upcomingAppointments.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  et {stats.upcomingAppointments.length - 3} autres rendez-vous...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alerte factures en retard */}
        {(stats.pendingInvoices || 0) > 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800">
                  Attention aux factures en attente
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  Vous avez {stats.pendingInvoices} factures en attente de paiement.
                  Pensez à effectuer un suivi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Information positive */}
        {(stats.todayAppointments || 0) === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-semibold text-green-800">
                  Journée tranquille
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Aucun rendez-vous prévu aujourd'hui. 
                  Parfait pour traiter les tâches administratives.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bouton de rafraîchissement */}
      <div className="flex justify-end">
        <button
          onClick={fetchDashboardStats}
          className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          disabled={loading}
        >
          <svg
            className={`w-4 h-4 mr-2 text-gray-500 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582M20 20v-5h-.581M4 20l4-4m0 0v.01M20 4l-4 4m0 0v-.01"
            />
          </svg>
          {loading ? 'Chargement...' : 'Rafraîchir'}
        </button>
      </div>
    </div>
  );
};

export default DashboardStats;