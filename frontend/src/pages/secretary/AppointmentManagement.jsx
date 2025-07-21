//frontend\src\pages\secretary\AppointmentManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Search, Filter, Edit, Trash2, X, Save, Eye } from 'lucide-react';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    medecin: '',
    status: '',
    search: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    fetchMedecins();
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/secretary/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des RDV:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedecins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/secretary/medecins', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMedecins(data);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/secretary/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    if (filters.date) {
      filtered = filtered.filter(apt => 
        new Date(apt.date_rend).toISOString().split('T')[0] === filters.date
      );
    }

    if (filters.medecin) {
      filtered = filtered.filter(apt => apt.id_medecin == filters.medecin);
    }

    if (filters.status) {
      filtered = filtered.filter(apt => apt.statut === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(apt => 
        `${apt.patient_nom} ${apt.patient_prenom}`.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleCreateAppointment = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/secretary/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchAppointments();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Erreur lors de la création du RDV:', error);
    }
  };

  const handleUpdateAppointment = async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/secretary/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchAppointments();
        setEditingAppointment(null);
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/secretary/appointments/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAppointments();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'confirmé': 'bg-green-100 text-green-800',
      'annulé': 'bg-red-100 text-red-800',
      'reporté': 'bg-yellow-100 text-yellow-800',
      'terminé': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Rendez-vous</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau RDV
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Médecin</label>
            <select
              value={filters.medecin}
              onChange={(e) => setFilters({...filters, medecin: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Tous les médecins</option>
              {medecins.map(medecin => (
                <option key={medecin.id_m} value={medecin.id_m}>
                  Dr. {medecin.nom} {medecin.prenom} - {medecin.specialite}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Tous les statuts</option>
              <option value="confirmé">Confirmé</option>
              <option value="annulé">Annulé</option>
              <option value="reporté">Reporté</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nom du patient..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-10 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des RDV */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id_r} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient_nom} {appointment.patient_prenom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.patient_telephone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {appointment.medecin_nom} {appointment.medecin_prenom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.specialite}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(appointment.date_rend).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.heure}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {appointment.motif}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(appointment.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingAppointment(appointment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appointment.id_r)}
                        className="text-red-600 hover:text-red-900"
                        title="Annuler"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun rendez-vous trouvé
          </div>
        )}
      </div>

      {/* Modal Création RDV */}
      {showCreateForm && (
        <AppointmentForm
          patients={patients}
          medecins={medecins}
          onSubmit={handleCreateAppointment}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* Modal Modification RDV */}
      {editingAppointment && (
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          medecins={medecins}
          onSubmit={(data) => handleUpdateAppointment(editingAppointment.id_r, data)}
          onClose={() => setEditingAppointment(null)}
          isEditing={true}
        />
      )}
    </div>
  );
};

const AppointmentForm = ({ appointment, patients, medecins, onSubmit, onClose, isEditing = false }) => {
  const [formData, setFormData] = useState({
    patientId: appointment?.id_patient || '',
    medecinId: appointment?.id_medecin || '',
    date: appointment?.date_rend ? new Date(appointment.date_rend).toISOString().split('T')[0] : '',
    heure: appointment?.heure || '',
    motif: appointment?.motif || '',
    type: appointment?.type || 'consultation',
    salle: appointment?.salle || '',
    statut: appointment?.statut || 'confirmé'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Modifier le RDV' : 'Nouveau Rendez-vous'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(patient => (
                <option key={patient.id_p} value={patient.id_p}>
                  {patient.nom} {patient.prenom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Médecin</label>
            <select
              required
              value={formData.medecinId}
              onChange={(e) => setFormData({...formData, medecinId: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Sélectionner un médecin</option>
              {medecins.map(medecin => (
                <option key={medecin.id_m} value={medecin.id_m}>
                  Dr. {medecin.nom} {medecin.prenom} - {medecin.specialite}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <input
                type="time"
                required
                value={formData.heure}
                onChange={(e) => setFormData({...formData, heure: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <textarea
              required
              value={formData.motif}
              onChange={(e) => setFormData({...formData, motif: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
              placeholder="Motif du rendez-vous..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="consultation">Consultation</option>
                <option value="controle">Contrôle</option>
                <option value="urgence">Urgence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
              <input
                type="text"
                value={formData.salle}
                onChange={(e) => setFormData({...formData, salle: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Numéro de salle"
              />
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({...formData, statut: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="confirmé">Confirmé</option>
                <option value="annulé">Annulé</option>
                <option value="reporté">Reporté</option>
                <option value="terminé">Terminé</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSubmit(formData);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isEditing ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;