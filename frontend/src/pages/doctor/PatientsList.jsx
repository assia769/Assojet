
// frontend/src/pages/doctor/PatientsList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorService from '../../services/doctorService';
import {
  Search,
  Eye,
  FileText,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail
} from 'lucide-react';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadPatients();
  }, [pagination.page, searchTerm]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await DoctorService.getPatientsList({
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit
      });
      
      console.log('✅ Patients chargés:', response);
      
      setPatients(response.patients || []);
      setPagination(prev => ({
        ...prev,
        ...response.pagination
      }));
      
    } catch (error) {
      console.error('❌ Erreur chargement patients:', error);
      setError('Erreur lors du chargement des patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getGroupeSanguinColor = (groupe) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-50 text-red-600',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-50 text-blue-600',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-50 text-purple-600',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-50 text-green-600'
    };
    return colors[groupe] || 'bg-gray-100 text-gray-800';
  };

  // Fonction pour construire l'URL de l'image de profil
  const getPatientPhotoUrl = (patient) => {
    if (patient.photo) {
      // Si l'URL commence déjà par http, la retourner telle quelle
      if (patient.photo.startsWith('http')) {
        return patient.photo;
      }
      // Sinon, construire l'URL complète
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      return `${baseUrl}${patient.photo}`;
    }
    // Image par défaut si pas de photo
    return '/default-avatar.png';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Mes Patients
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos patients et consultez leurs dossiers médicaux
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  Rechercher
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Rechercher un patient..."
                    type="search"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <div className="text-sm text-gray-500">
                {patients.length > 0 && (
                  <span>{patients.length} patient{patients.length > 1 ? 's' : ''} trouvé{patients.length > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur de chargement
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={loadPatients}
                  className="bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des patients */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-500">Chargement des patients...</span>
            </div>
          </div>
        ) : patients.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <li key={patient.id_p || patient.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                        src={getPatientPhotoUrl(patient)}
                        alt={`${patient.nom || ''} ${patient.prenom || ''}`}
                        onError={(e) => {
                          console.log('❌ Erreur chargement image pour:', patient);
                          e.target.src = '/default-avatar.png';
                        }}
                        onLoad={() => {
                          console.log('✅ Image chargée pour:', patient.nom, patient.prenom);
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.nom} {patient.prenom}
                        </p>
                        {patient.groupe_sanguin && (
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGroupeSanguinColor(patient.groupe_sanguin)}`}>
                            {patient.groupe_sanguin}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Mail className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span className="truncate">{patient.email || 'Email non renseigné'}</span>
                        {patient.telephone && (
                          <>
                            <span className="mx-2">•</span>
                            <Phone className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            {patient.telephone}
                          </>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">{patient.total_consultations || 0}</span> consultation(s)
                        {patient.derniere_consultation && (
                          <>
                            {' • '}
                            <span>Dernière visite: {formatDate(patient.derniere_consultation)}</span>
                          </>
                        )}
                      </div>
                      {patient.date_naissance && (
                        <div className="mt-1 text-xs text-gray-400">
                          Né(e) le {formatDate(patient.date_naissance)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/doctor/patients/${patient.id_p || patient.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      title="Voir les détails du patient"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Link>
                    <Link
                      to={`/doctor/medical-records/${patient.id_p || patient.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      title="Consulter le dossier médical"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Dossier
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 
                'Essayez de modifier vos critères de recherche.' : 
                'Vous n\'avez pas encore de patients assignés.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                à{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                sur{' '}
                <span className="font-medium">{pagination.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Pages */}
                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    pageNumber = index + 1;
                  } else {
                    // Logic pour afficher les bonnes pages quand il y en a beaucoup
                    if (pagination.page <= 3) {
                      pageNumber = index + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + index;
                    } else {
                      pageNumber = pagination.page - 2 + index;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNumber }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsList;