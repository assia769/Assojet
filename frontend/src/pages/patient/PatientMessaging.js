// frontend/src/pages/patient/PatientMessaging.js
import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  UserIcon,
  PlusIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import PatientService from '../../services/PatientService';

const PatientMessaging = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    subject: '',
    content: ''
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
    fetchDoctors();
  }, []);

  const fetchMessages = async () => {
    try {
      setError('');
      const data = await PatientService.getMyMessages();
      setMessages(data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await PatientService.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.recipient_id || !newMessage.subject.trim() || !newMessage.content.trim()) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    setSending(true);
    setError('');
    
    try {
      await PatientService.sendMessage({
        recipient_id: newMessage.recipient_id,
        subject: newMessage.subject,
        content: newMessage.content
      });
      
      setNewMessage({ recipient_id: '', subject: '', content: '' });
      setShowNewMessage(false);
      await fetchMessages(); // Recharger les messages
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setError(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await PatientService.markMessageAsRead(messageId);
      
      // Mettre à jour l'état local
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, read_by_patient: true, lu: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('fr-FR', { weekday: 'long' });
      } else {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      }
    } catch (error) {
      return PatientService.formatDateTime(dateString);
    }
  };

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
          <ChatBubbleLeftIcon className="h-8 w-8 text-emerald-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">
            Messagerie
          </h1>
        </div>
        <button
          onClick={() => setShowNewMessage(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau message
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Nouveau message modal */}
      {showNewMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setShowNewMessage(false)} />
            
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nouveau message
              </h3>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinataire
                  </label>
                  <select
                    value={newMessage.recipient_id}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, recipient_id: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Sélectionner un médecin</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.nom} {doctor.prenom}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Objet de votre message"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    placeholder="Tapez votre message ici..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewMessage(false);
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    )}
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Liste des messages */}
      <div className="bg-white rounded-lg shadow-sm">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun message
            </h3>
            <p className="text-gray-500 mb-4">
              Vous n'avez encore aucune conversation avec vos médecins.
            </p>
            <button
              onClick={() => setShowNewMessage(true)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Envoyer un message
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => {
              // Gérer les différents noms de propriétés
              const isUnread = message.message_type === 'received' && 
                             (!message.read_by_patient && !message.lu);
              const messageDate = message.created_at || message.date_mess;
              const messageContent = message.content || message.contenu;
              const messageSubject = message.subject || message.objet;
              
              return (
                <div
                  key={message.id || message.id_mess}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    if (isUnread) {
                      markAsRead(message.id || message.id_mess);
                    }
                  }}
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.message_type === 'received' 
                          ? 'bg-blue-100' 
                          : 'bg-emerald-100'
                      }`}>
                        <UserIcon className={`h-5 w-5 ${
                          message.message_type === 'received' 
                            ? 'text-blue-600' 
                            : 'text-emerald-600'
                        }`} />
                      </div>
                    </div>
                    
                    {/* Contenu du message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {message.message_type === 'received' 
                              ? `Dr. ${message.sender_nom} ${message.sender_prenom}`
                              : 'Vous'
                            }
                          </p>
                          {isUnread && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Nouveau
                            </span>
                          )}
                          {message.message_type === 'sent' && (
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDate(messageDate)}
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mt-1">
                        {messageSubject}
                      </h4>
                      
                      <p className="mt-2 text-gray-600 line-clamp-3">
                        {messageContent}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">
          À propos de la messagerie
        </h3>
        <p className="text-sm text-blue-700">
          Utilisez cette messagerie pour communiquer avec vos médecins de manière sécurisée. 
          Pour les urgences, contactez directement votre médecin par téléphone.
        </p>
      </div>
    </div>
  );
};

export default PatientMessaging;