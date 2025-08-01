// frontend/src/pages/patient/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftIcon, 
  BellIcon,
  PlusIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/PatientService'; 

const PatientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: 0,
    totalDocuments: 0,
    unreadMessages: 0,
    unreadNotifications: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // ✅ Appels avec gestion d'erreur robuste
      const results = await Promise.allSettled([
        patientService.getDashboardStats().catch(err => {
          console.warn('Dashboard stats failed:', err.message);
          return {
            upcomingAppointments: 0,
            totalDocuments: 0,
            unreadMessages: 0,
            unreadNotifications: 0
          };
        }),
        patientService.getMyAppointments({ limit: 3 }).catch(err => {
          console.warn('Appointments failed:', err.message);
          return [];
        })
      ]);
      
      // ✅ Traitement des résultats
      const [dashboardResult, appointmentsResult] = results;
      
      if (dashboardResult.status === 'fulfilled') {
        const dashData = dashboardResult.value || {};
        setDashboardData({
          upcomingAppointments: dashData.upcomingAppointments || 0,
          totalDocuments: dashData.totalDocuments || 0,
          unreadMessages: dashData.unreadMessages || 0,
          unreadNotifications: dashData.unreadNotifications || 0
        });
      }
      
      if (appointmentsResult.status === 'fulfilled') {
        const appointments = appointmentsResult.value || [];
        console.log('Appointments data:', appointments);
        
        // ✅ Vérifier que c'est bien un tableau
        if (!Array.isArray(appointments)) {
          console.warn('Appointments is not an array:', appointments);
          setRecentAppointments([]);
          return;
        }
        
        // ✅ Filtrer et trier les RDV
        const recentRdv = appointments
          .filter(apt => {
            // Vérifier que l'objet appointment existe
            if (!apt) return false;
            
            // Utiliser date_rend au lieu de date_rdv pour correspondre à votre DB
            const dateField = apt.date_rend || apt.date_rdv;
            if (!dateField) return false;
            
            try {
              const rdvDate = new Date(dateField);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // Inclure les RDV à venir et ceux d'aujourd'hui
              const isUpcoming = rdvDate >= today;
              const isConfirmed = apt.statut === 'confirmé' || apt.status === 'confirmed';
              const isPending = apt.statut === 'en_attente' || apt.status === 'pending';
              
              return isUpcoming || isConfirmed || isPending;
            } catch (error) {
              console.warn('Date parsing error for appointment:', apt.id_r || apt.id);
              return false;
            }
          })
          .sort((a, b) => {
            const dateA = new Date(a.date_rend || a.date_rdv);
            const dateB = new Date(b.date_rend || b.date_rdv);
            return dateA - dateB;
          })
          .slice(0, 3);
        
        setRecentAppointments(recentRdv);
      }
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setError('Impossible de charger certaines données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmé':
      case 'confirmed': 
        return 'text-green-600 bg-green-100';
      case 'en_attente':
      case 'pending': 
        return 'text-yellow-600 bg-yellow-100';
      case 'annulé':
      case 'cancelled': 
        return 'text-red-600 bg-red-100';
      case 'terminé':
      case 'completed': 
        return 'text-blue-600 bg-blue-100';
      default: 
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmé':
      case 'confirmed': 
        return 'Confirmé';
      case 'en_attente':
      case 'pending': 
        return 'En attente';
      case 'annulé':
      case 'cancelled': 
        return 'Annulé';
      case 'terminé':
      case 'completed': 
        return 'Terminé';
      default: 
        return 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Date formatting error:', error);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-gray-600">Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bonjour, {user?.prenom || 'Patient'} {user?.nom || ''}
        </h1>
        <p className="text-gray-600">
          Bienvenue dans votre espace patient
        </p>
      </div>

      {/* ✅ Affichage d'avertissement si erreur non critique */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">RDV à venir</p>
              <p className="text-2xl font-bold text-gray-900">
                {Number(dashboardData?.upcomingAppointments) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {Number(dashboardData?.totalDocuments) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChatBubbleLeftIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages non lus</p>
              <p className="text-2xl font-bold text-gray-900">
                {Number(dashboardData?.unreadMessages) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BellIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">
                {Number(dashboardData?.unreadNotifications) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/patient/book-appointment"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
          >
            <PlusIcon className="h-6 w-6 text-emerald-600 mr-3" />
            <span className="font-medium text-gray-900">Prendre RDV</span>
          </Link>

          <Link
            to="/patient/appointments"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
            <span className="font-medium text-gray-900">Mes RDV</span>
          </Link>

          <Link
            to="/patient/documents"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3" />
            <span className="font-medium text-gray-900">Documents</span>
          </Link>

          <Link
            to="/patient/messaging"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
          >
            <ChatBubbleLeftIcon className="h-6 w-6 text-orange-600 mr-3" />
            <span className="font-medium text-gray-900">Messagerie</span>
          </Link>
        </div>
      </div>

      {/* RDV récents */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Prochains rendez-vous
          </h2>
          <Link
            to="/patient/appointments"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Voir tous
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Aucun rendez-vous programmé</p>
            <p className="text-sm text-gray-400 mb-4">
              Prenez rendez-vous dès maintenant
            </p>
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Prendre un RDV
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id_r || appointment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {formatDate(appointment.date_rend || appointment.date_rdv)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.heure || appointment.heure_rdv || 'Heure non définie'} - {appointment.type || appointment.type_consultation || 'Consultation'}
                      </p>
                      {(appointment.doctor_nom || appointment.doctor_prenom) && (
                        <p className="text-sm text-gray-500">
                          Dr. {appointment.doctor_prenom || ''} {appointment.doctor_nom || 'Non assigné'}
                        </p>
                      )}
                      {(appointment.motif || appointment.notes) && (
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                          {appointment.motif || appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.statut || appointment.status)}`}
                  >
                    {getStatusText(appointment.statut || appointment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer avec bouton de rafraîchissement */}
      <div className="text-center">
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Actualisation...' : '🔄 Actualiser les données'}
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;