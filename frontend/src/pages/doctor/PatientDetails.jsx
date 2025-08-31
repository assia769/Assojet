// frontend/src/pages/doctor/PatientDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DoctorService from '../../services/doctorService';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Pill,
  AlertTriangle,
  Edit3,
  Plus
} from 'lucide-react';

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informations');
  const [user] = useState([]);

  useEffect(() => {
    loadPatientDetails();
  }, [patientId]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);
      const data = await DoctorService.getPatientDetails(patientId);
      setPatientData(data);
    } catch (error) {
      console.error('Erreur chargement patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Patient non trouvé</h3>
        <Link
          to="/doctor/patients"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const { patient, consultations, prescriptions } = patientData;

  const tabs = [
    { id: 'informations', name: 'Informations', icon: User },
    { id: 'consultations', name: 'Consultations', icon: FileText },
    { id: 'prescriptions', name: 'Prescriptions', icon: Pill }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <Link
              to="/doctor/patients"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Link>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {patient.nom} {patient.prenom}
            </h2>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Link
            to={`/doctor/consultation?patient=${patientId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle consultation
          </Link>
          <Link
            to={`/doctor/medical-records/${patientId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Dossier médical
          </Link>
        </div>
      </div>

      {/* Patient Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
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
            <div className="ml-6">
              <h3 className="text-xl font-bold text-gray-900">
                {patient.nom} {patient.prenom}
              </h3>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span>{calculateAge(patient.date_naiss)} ans</span>
                <span>•</span>
                <span>{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                {patient.groupe_sanguin && (
                  <>
                    <span>•</span>
                    <span className="font-medium">{patient.groupe_sanguin}</span>
                  </>
                )}
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {patient.email}
                </div>
                {patient.telephone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {patient.telephone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="sm:hidden">
          <select
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'informations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informations personnelles
                </h3>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {patient.adresse || 'Non renseignée'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(patient.date_naiss)}
                    </dd>
                  </div>
                </dl>
              </div>
              {patient.allergies && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Allergies</h3>
                  <p className="text-sm text-gray-700 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    {patient.allergies}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'consultations' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Historique des consultations
              </h3>
              {consultations.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune consultation enregistrée.</p>
              ) : (
                <ul className="space-y-4">
                  {consultations.map((consultation, index) => {
                    const { date, time } = formatDateTime(consultation.date_consultation);
                    return (
                      <li key={index} className="border rounded p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">Date : {date} à {time}</p>
                            <p className="text-sm text-gray-700 mt-1">Motif : {consultation.motif}</p>
                            <p className="text-sm text-gray-700">Diagnostic : {consultation.diagnostic}</p>
                          </div>
                          
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Prescriptions médicales
              </h3>
              {prescriptions.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune prescription disponible.</p>
              ) : (
                <ul className="space-y-4">
                  {prescriptions.map((prescription, index) => (
                    <li key={index} className="border rounded p-4 shadow-sm">
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        Date : {formatDate(prescription.date_prescription)}
                      </p>
                      <p className="text-sm text-gray-700">Médicaments : {prescription.medicaments}</p>
                      <p className="text-sm text-gray-700">Posologie : {prescription.posologie}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
