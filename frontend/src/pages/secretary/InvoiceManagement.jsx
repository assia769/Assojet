// frontend/src/pages/secretary/InvoiceManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Euro, 
  Calendar, 
  User, 
  Check, 
  Clock, 
  X,
  Edit,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react';
import { secretaryService } from '../../services/secretaryService';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchInvoices(),
        fetchPatients()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (patientFilter) params.patientId = patientFilter;

      const response = await secretaryService.getInvoices(params);
      const rawInvoices = response || [];

      console.log("🔎 Response brute invoices:", response);
      // console.log("📦 Invoices data:", response.data);
      // console.log("📦 Invoices data.data:", response.data?.data);

      setInvoices(rawInvoices);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      setInvoices([]);
      throw error;
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await secretaryService.getPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      setPatients([]);
      throw error;
    }
  };

  const updateInvoiceStatus = async (invoiceId, status, modePaiement) => {
    try {
      console.log('Mise à jour facture:', { invoiceId, status, modePaiement });
      
      await secretaryService.updateInvoiceStatus(invoiceId, { 
        status, 
        modePaiement 
      });
      
      await fetchInvoices();
      setShowUpdateModal(false);
      setSelectedInvoice(null);
      
      console.log('Facture mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
      setError('Erreur lors de la mise à jour de la facture');
    }
  };

  const handleFilterChange = async (filterType, value) => {
    try {
      if (filterType === 'status') {
        setStatusFilter(value);
      } else if (filterType === 'patient') {
        setPatientFilter(value);
      }
      
      const params = {};
      const newStatusFilter = filterType === 'status' ? value : statusFilter;
      const newPatientFilter = filterType === 'patient' ? value : patientFilter;
      
      if (newStatusFilter !== 'all') params.status = newStatusFilter;
      if (newPatientFilter) params.patientId = newPatientFilter;

      const response = await secretaryService.getInvoices(params);
      const rawInvoices = response || [];

      setInvoices(rawInvoices);
    } catch (error) {
      console.error('Erreur lors de l\'application des filtres:', error);
      setError('Erreur lors de l\'application des filtres');
      setInvoices([]);
    }
  };



  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'Payée' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'carte': return <CreditCard size={16} />;
      case 'especes': return <Banknote size={16} />;
      case 'cheque': return <FileText size={16} />;
      case 'virement': return <Wallet size={16} />;
      default: return <Euro size={16} />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch(method) {
      case 'carte': return 'Carte bancaire';
      case 'especes': return 'Espèces';
      case 'cheque': return 'Chèque';
      case 'virement': return 'Virement';
      default: return 'Non défini';
    }
  };

  // Ensure invoices is always an array before filtering
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safePatients = Array.isArray(patients) ? patients : [];

  const filteredInvoices = safeInvoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      `${invoice.patient_nom} ${invoice.patient_prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id_f.toString().includes(searchTerm);
    
    return matchesSearch;
  });

  const UpdateInvoiceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Mettre à jour la facture #{selectedInvoice?.id_f}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={selectedInvoice?.statut || 'pending'}
              onChange={(e) => setSelectedInvoice({...selectedInvoice, statut: e.target.value})}
            >
              <option value="pending">En attente</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={selectedInvoice?.mode_paiement || ''}
              onChange={(e) => setSelectedInvoice({...selectedInvoice, mode_paiement: e.target.value})}
            >
              <option value="">Sélectionner</option>
              <option value="carte">Carte bancaire</option>
              <option value="especes">Espèces</option>
              <option value="cheque">Chèque</option>
              <option value="virement">Virement</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => updateInvoiceStatus(
              selectedInvoice.id_f, 
              selectedInvoice.statut, 
              selectedInvoice.mode_paiement
            )}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Mettre à jour
          </button>
          <button
            onClick={() => {
              setShowUpdateModal(false);
              setSelectedInvoice(null);
            }}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Factures</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">
              Total: {filteredInvoices.length} facture(s)
            </span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Patient ou N° facture..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={patientFilter}
              onChange={(e) => handleFilterChange('patient', e.target.value)}
            >
              <option value="">Tous les patients</option>
              {safePatients.map(patient => (
                <option key={patient.id_p} value={patient.id_p}>
                  {patient.nom} {patient.prenom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actions
            </label>
            <button
              onClick={loadData}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center"
            >
              <Filter size={20} className="mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {safeInvoices.filter(i => i.statut === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payées</p>
              <p className="text-2xl font-bold text-green-600">
                {safeInvoices.filter(i => i.statut === 'paid').length}
              </p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Annulées</p>
              <p className="text-2xl font-bold text-red-600">
                {safeInvoices.filter(i => i.statut === 'cancelled').length}
              </p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total payé</p>
              <p className="text-2xl font-bold text-blue-600">
                {safeInvoices
                  .filter(i => i.statut === 'paid')
                  .reduce((sum, i) => sum + parseFloat(i.prix || 0), 0)
                  .toFixed(2)}€
              </p>
            </div>
            <Euro className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id_f} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{invoice.id_f}
                        </div>
                        {invoice.diagnostic && (
                          <div className="text-sm text-gray-500">
                            {invoice.diagnostic}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.patient_nom} {invoice.patient_prenom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.date_f).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Euro className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.prix}€
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(invoice.mode_paiement)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getPaymentMethodLabel(invoice.mode_paiement)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowUpdateModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune facture</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune facture ne correspond aux filtres sélectionnés.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de mise à jour */}
      {showUpdateModal && <UpdateInvoiceModal />}
    </div>
  );
};

export default InvoiceManagement;