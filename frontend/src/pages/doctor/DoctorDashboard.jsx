// frontend/src/pages/doctor/DoctorDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorService from '../../services/doctorService';
import {
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useState([]);
  

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await DoctorService.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const upcomingAppointments = dashboardData?.upcomingAppointments || [];

  const statsCards = [
    {
      name: "RDV aujourd'hui",
      value: stats.todayAppointments || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/doctor/calendar'
    },
    {
      name: 'Consultations ce mois',
      value: stats.monthConsultations || 0,
      icon: FileText,
      color: 'bg-green-500',
      link: '/doctor/consultation'
    },
    {
      name: 'Patients totaux',
      value: stats.totalPatients || 0,
      icon: Users,
      color: 'bg-purple-500',
      link: '/doctor/patients'
    },
    {
      name: 'Messages non lus',
      value: stats.unreadMessages || 0,
      icon: MessageSquare,
      color: 'bg-orange-500',
      link: '/doctor/messaging'
    }
  ];

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Tableau de bord
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Vue d'ensemble de votre activité médicale
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/doctor/consultation"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="h-4 w-4 mr-2" />
            Nouvelle consultation
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prochains rendez-vous */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Prochains rendez-vous
              </h3>
              <Link
                to="/doctor/calendar"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.date_rend);
                  return (
                    <div
                      key={appointment.id_r}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      {/* <img
                        className="h-10 w-10 rounded-full"
                        src={appointment.photo || '/api/placeholder/40/40'}
                        alt=""
                      /> */}
                      <img
                      src={user.photo ? `http://localhost:5000${user.photo}` : '/default-avatar.png'}
                      alt={`${user.nom || ''} ${user.prenom || ''}`}
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '2px solid #ddd'
                      }}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.nom} {appointment.prenom}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.motif}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{time}</p>
                        <p className="text-xs text-gray-500">{date}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucun rendez-vous
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vous n'avez pas de rendez-vous programmés prochainement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/doctor/patients"
                className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                    <Users className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Mes patients
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Gérer la liste de vos patients
                  </p>
                </div>
              </Link>

              <Link
                to="/doctor/consultation"
                className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 group-hover:bg-green-100">
                    <FileText className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Consultation
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Créer une nouvelle consultation
                  </p>
                </div>
              </Link>

              <Link
                to="/doctor/prescriptions"
                className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                    <Activity className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Ordonnances
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Gérer les prescriptions
                  </p>
                </div>
              </Link>

              <Link
                to="/doctor/statistics"
                className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-600 group-hover:bg-orange-100">
                    <TrendingUp className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Statistiques
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Analyser votre activité
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;