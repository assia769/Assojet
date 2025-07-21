// frontend/src/components/secretary/QuickActions.jsx
import React, { useState } from 'react';
import { Plus, Calendar, Users, FileText, Send, Clock } from 'lucide-react';

const QuickActions = () => {
  const [sendingReminders, setSendingReminders] = useState(false);

  const handleSendReminders = async () => {
    try {
      setSendingReminders(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/secretary/send-reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi des rappels');
      }

      const result = await response.json();
      
      // Afficher une notification de succès
      alert(`Rappels envoyés avec succès ! ${result.reminders.filter(r => r.status === 'sent').length} rappels envoyés.`);
    } catch (error) {
      console.error('Erreur envoi rappels:', error);
      alert('Erreur lors de l\'envoi des rappels: ' + error.message);
    } finally {
      setSendingReminders(false);
    }
  };

  const actions = [
    {
      title: 'Nouveau RDV',
      description: 'Planifier un nouveau rendez-vous',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      action: () => {
        // Navigation vers la page de création de RDV
        window.location.href = '/secretary/appointments?action=create';
      }
    },
    {
      title: 'Voir Calendrier',
      description: 'Consulter le planning complet',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      action: () => {
        window.location.href = '/secretary/calendar';
      }
    },
    {
      title: 'Nouveau Patient',
      description: 'Ajouter un nouveau patient',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      action: () => {
        window.location.href = '/secretary/patients?action=create';
      }
    },
    {
      title: 'Gestion Factures',
      description: 'Voir les factures en attente',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      action: () => {
        window.location.href = '/secretary/invoices';
      }
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Actions Rapides
        </h3>
        
        {/* Bouton d'envoi de rappels */}
        <button
          onClick={handleSendReminders}
          disabled={sendingReminders}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
            sendingReminders 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {sendingReminders ? (
            <>
              <Clock className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="-ml-1 mr-2 h-4 w-4" />
              Envoyer Rappels
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className="group relative bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-start space-x-4">
                <div className={`flex items-center justify-center w-12 h-12 ${action.iconBg} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Indicateur hover */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-lg transition-colors duration-200"></div>
            </button>
          );
        })}
      </div>

      {/* Section statistiques rapides */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Statuts des tâches
        </h4>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span className="text-gray-600">Tâches complétées</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-gray-600">En attente</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
            <span className="text-gray-600">Urgent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;