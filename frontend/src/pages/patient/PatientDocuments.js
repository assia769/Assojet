// PatientDocuments.js - Version corrigée avec clés uniques
import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

import patientService from '../../services/PatientService';

const PatientDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await patientService.getMyDocuments();
      console.log('Documents récupérés:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      console.log('Téléchargement du document:', documentId, filename);
      
      if (!documentId) {
        console.error('ID du document manquant');
        alert('Erreur: ID du document manquant');
        return;
      }
      
      const button = document.activeElement;
      const originalText = button.textContent;
      button.textContent = 'Téléchargement...';
      button.disabled = true;
      
      try {
        const result = await patientService.downloadDocument(documentId);
        console.log('Téléchargement réussi:', result);
        
        if (result.success) {
          console.log('Fichier téléchargé:', result.filename);
        }
        
      } finally {
        if (button) {
          button.textContent = originalText;
          button.disabled = false;
        }
      }
      
    } catch (error) {
      console.error('Erreur téléchargement document:', error);
      
      // Messages d'erreur plus conviviaux
      let userMessage = 'Une erreur est survenue lors du téléchargement.';
      
      if (error.message.includes('non trouvé')) {
        userMessage = 'Ce document n\'existe pas ou n\'est plus disponible.';
      } else if (error.message.includes('non autorisé')) {
        userMessage = 'Vous n\'avez pas l\'autorisation d\'accéder à ce document.';
      } else if (error.message.includes('réseau')) {
        userMessage = 'Problème de connexion. Vérifiez votre réseau et réessayez.';
      } else if (error.message.includes('serveur')) {
        userMessage = 'Erreur du serveur. Contactez l\'assistance technique.';
      } else if (error.message) {
        userMessage = error.message;
      }
      
      alert(userMessage);
      
      // Restaurer le bouton en cas d'erreur
      const button = document.activeElement;
      if (button) {
        button.textContent = button.textContent.replace('Téléchargement...', 'Télécharger');
        button.disabled = false;
      }
    }
  };

  const getDocumentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'prescription':
        return '💊';
      case 'ordonnance':
        return '📋';
      case 'analyse':
        return '🔬';
      case 'radio':
        return '📷';
      case 'compte_rendu':
        return '📄';
      default:
        return '📄';
    }
  };

  const getDocumentTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'prescription':
        return 'Prescription';
      case 'ordonnance':
        return 'Ordonnance';
      case 'analyse':
        return 'Analyse médicale';
      case 'radio':
        return 'Radiologie';
      case 'compte_rendu':
        return 'Compte rendu';
      default:
        return 'Document médical';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.type_fichier?.toLowerCase() === filter || doc.type?.toLowerCase() === filter;
  });

  const documentTypes = [
    { key: 'all', label: 'Tous les documents' },
    { key: 'prescription', label: 'Prescriptions' },
    { key: 'ordonnance', label: 'Ordonnances' },
    { key: 'analyse', label: 'Analyses' },
    { key: 'radio', label: 'Radiologie' },
    { key: 'compte_rendu', label: 'Comptes rendus' }
  ];

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
      <div className="flex items-center">
        <DocumentTextIcon className="h-8 w-8 text-emerald-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">
          Mes documents médicaux
        </h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => (d.type_fichier || d.type) === 'prescription').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ordonnances</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => (d.type_fichier || d.type) === 'ordonnance').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔬</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Analyses</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => (d.type_fichier || d.type) === 'analyse').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {documentTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setFilter(type.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type.key
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des documents */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun document
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Vous n\'avez aucun document médical.'
                : `Aucun document de type "${documentTypes.find(t => t.key === filter)?.label}".`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((document, index) => (
              <div key={`doc-${document.id_fich || document.id}-${index}`} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Icône du document */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{getDocumentIcon(document.type_fichier || document.type)}</span>
                      </div>
                    </div>
                    
                    {/* Informations du document */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {document.nom_fichier || document.title || 'Document médical'}
                      </h3>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          {getDocumentTypeLabel(document.type_fichier || document.type)}
                        </span>
                        
                        {document.doctor_nom && (
                          <>
                            <span className="mx-2">•</span>
                            <UserIcon className="h-4 w-4 mr-1" />
                            Dr. {document.doctor_nom} {document.doctor_prenom || ''}
                          </>
                        )}
                      </div>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(document.date_creation || document.created_at || Date.now()).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      
                      {(document.contenu || document.description || document.historique) && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {(document.contenu || document.description || document.historique || '').substring(0, 150)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(
                          document.id_fich || document.id, 
                          document.nom_fichier || document.filename || `document_${document.id_fich || document.id}.pdf`
                        )}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Télécharger
                      </button>
                      
                      {document.preview_url && (
                        <button
                          onClick={() => window.open(document.preview_url, '_blank')}
                          className="inline-flex items-center px-3 py-1 border border-emerald-300 text-emerald-700 text-sm rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Voir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">
          À propos de vos documents
        </h3>
        <p className="text-sm text-blue-700">
          Tous vos documents médicaux sont stockés de manière sécurisée. 
          Vous pouvez les télécharger à tout moment. En cas de problème d'accès 
          à un document, contactez votre médecin ou la secrétaire.
        </p>
      </div>
    </div>
  );
};

export default PatientDocuments;