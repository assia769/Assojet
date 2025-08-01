// frontend/src/pages/patient/AppointmentBooking.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import patientService from '../../services/PatientService';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date_rdv: '',
    heure_rdv: '',
    type_consultation: 'consultation',
    notes: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const consultationTypes = [
    { value: 'consultation', label: 'Consultation générale' },
    { value: 'controle', label: 'Consultation de contrôle' },
    { value: 'urgence', label: 'Consultation d\'urgence' },
    { value: 'suivi', label: 'Suivi médical' }
  ];

  useEffect(() => {
    const loadSlots = async () => {
      if (!formData.date_rdv) return;
      try {
        const response = await patientService.getAvailableSlots(formData.date_rdv);
        if (Array.isArray(response.availableSlots)) {
          setAvailableSlots(response.availableSlots);
        } else {
          setAvailableSlots([]);
          console.warn('Invalid slot format:', response);
        }
      } catch (err) {
        console.error('Erreur récupération créneaux:', err);
        setError(err.message || 'Erreur lors de la récupération des créneaux');
        setAvailableSlots([]);
      }
    };
    loadSlots();
  }, [formData.date_rdv]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await patientService.bookAppointment({
        date_rend: formData.date_rdv,
        heure: formData.heure_rdv,
        type: formData.type_consultation,
        motif: formData.notes
      });
      setSuccess(true);
      setTimeout(() => navigate('/patient/appointments'), 2000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Demande envoyée !
          </h2>
          <p className="text-gray-600 mb-4">
            Votre demande de rendez-vous a été envoyée. La secrétaire vous contactera pour confirmer.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <CalendarIcon className="h-8 w-8 text-emerald-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Prendre un rendez-vous</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date souhaitée</label>
            <input
              type="date"
              name="date_rdv"
              value={formData.date_rdv}
              onChange={handleChange}
              min={today}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {formData.date_rdv && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure souhaitée</label>
              {Array.isArray(availableSlots) && availableSlots.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun créneau disponible pour cette date</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <label
                      key={slot}
                      className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-colors ${
                        formData.heure_rdv === slot
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="heure_rdv"
                        value={slot}
                        checked={formData.heure_rdv === slot}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {slot}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de consultation</label>
            <select
              name="type_consultation"
              value={formData.type_consultation}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {consultationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez brièvement la raison de votre consultation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/patient')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.date_rdv || !formData.heure_rdv}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Envoi...' : 'Demander le RDV'}
            </button>
          </div>
        </form>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Information importante</h3>
          <p className="text-sm text-blue-700">
            Votre demande sera traitée par la secrétaire qui vous contactera pour confirmer le rendez-vous. Vous recevrez une notification une fois votre RDV confirmé.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
