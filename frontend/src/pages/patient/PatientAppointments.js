// frontend/src/pages/patient/PatientAppointments.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import patientService from '../../services/PatientService';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await patientService.getMyAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelModal || !cancelReason.trim()) return;

    setCancelling(true);
    try {
      await patientService.cancelAppointment(cancelModal.id, cancelReason);
      fetchAppointments();
      setCancelModal(null);
      setCancelReason('');
    } catch (error) {
      console.error('Erreur annulation RDV:', error);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const canCancelAppointment = (appointment) => {
    const appointmentDate = new Date(`${appointment.date_rdv}T${appointment.heure_rdv}`);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    return appointment.status !== 'cancelled' &&
      appointment.status !== 'completed' &&
      hoursDiff > 24;
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'upcoming') {
      return new Date(appointment.date_rdv) >= new Date() && appointment.status !== 'cancelled';
    }
    if (filter === 'past') {
      return new Date(appointment.date_rdv) < new Date() || appointment.status === 'completed';
    }
    if (filter === 'cancelled') {
      return appointment.status === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <CalendarIcon className="h-8 w-8 text-emerald-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">
            Mes rendez-vous
          </h1>
        </div>
        <Link
          to="/patient/book-appointment"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau RDV
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tous', count: appointments.length },
            { key: 'upcoming', label: 'À venir', count: appointments.filter(a => new Date(a.date_rdv) >= new Date() && a.status !== 'cancelled').length },
            { key: 'past', label: 'Passés', count: appointments.filter(a => new Date(a.date_rdv) < new Date() || a.status === 'completed').length },
            { key: 'cancelled', label: 'Annulés', count: appointments.filter(a => a.status === 'cancelled').length }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {/* Liste des RDV */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun rendez-vous
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Vous n\'avez aucun rendez-vous programmé.'
                : `Aucun rendez-vous dans cette catégorie.`
              }
            </p>
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Prendre un RDV
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {new Date(appointment.date_rdv).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                          >
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {appointment.heure_rdv}
                          <span className="mx-2">•</span>
                          {appointment.type_consultation}
                        </div>
                        
                        {appointment.doctor_nom && (
                          <div className="mt-1 flex items-center text-sm text-gray-600">
                            <UserIcon className="h-4 w-4 mr-1" />
                            Dr. {appointment.doctor_nom} {appointment.doctor_prenom}
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <p className="mt-2 text-sm text-gray-600">
                            {appointment.notes}
                          </p>
                        )}
                        
                        {appointment.cancellation_reason && (
                          <div className="mt-2 text-sm text-red-600">
                            <strong>Raison d'annulation:</strong> {appointment.cancellation_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {canCancelAppointment(appointment) && (
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => setCancelModal(appointment)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'annulation */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setCancelModal(null)} />
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Annuler le rendez-vous
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Êtes-vous sûr de vouloir annuler votre rendez-vous du{' '}
                {new Date(cancelModal.date_rdv).toLocaleDateString('fr-FR')} à{' '}
                {cancelModal.heure_rdv} ?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de l'annulation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Expliquez pourquoi vous annulez ce rendez-vous..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setCancelModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={cancelling || !cancelReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;