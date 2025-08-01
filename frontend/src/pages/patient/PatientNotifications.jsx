// frontend/src/pages/patient/PatientNotifications.js
import React, { useState, useEffect } from 'react';
import { 
  BellIcon,
  CheckIcon,
  ClockIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import patientService from '../../services/PatientService'; 

const PatientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await patientService.getMyNotifications(); // Utiliser patientService
      setNotifications(data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment': return <CalendarIcon className="h-6 w-6 text-emerald-600" />;
      case 'reminder': return <ClockIcon className="h-6 w-6 text-yellow-600" />;
      case 'message': return <ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />;
      case 'document': return <DocumentTextIcon className="h-6 w-6 text-purple-600" />;
      case 'alert': return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      default: return <BellIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read; // Utiliser is_read pour le filtre
    if (filter === 'read') return n.is_read;
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
      <div className="flex items-center">
        <BellIcon className="h-8 w-8 text-emerald-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Mes notifications</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {[ 
            { key: 'all', label: 'Toutes', count: notifications.length },
            { key: 'unread', label: 'Non lues', count: notifications.filter(n => !n.is_read).length },
            { key: 'read', label: 'Lues', count: notifications.filter(n => n.is_read).length }
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

      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">Vous n'avez pas encore de notifications.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div key={notif.id} className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${notif.is_read ? 'text-gray-500' : 'text-gray-900'}`}>
                  {notif.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleString('fr-FR', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {!notif.is_read && (
                <div className="ml-2">
                  <CheckIcon className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientNotifications;
