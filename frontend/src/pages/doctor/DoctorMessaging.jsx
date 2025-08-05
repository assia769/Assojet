// DoctorMessaging.js
import React, { useState, useEffect } from 'react';
import DoctorService from '../../services/doctorService';

const DoctorMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await DoctorService.getMessages();
      setMessages(data.messages);
      
      // Grouper les messages par conversation
      const conversationsMap = new Map();
      data.messages.forEach(message => {
        const userId = message.expediteur.id === 'current_doctor_id' 
          ? message.destinataire.id 
          : message.expediteur.id;
        
        if (!conversationsMap.has(userId)) {
          conversationsMap.set(userId, {
            user: message.expediteur.id === 'current_doctor_id' 
              ? message.destinataire 
              : message.expediteur,
            lastMessage: message,
            unreadCount: 0
          });
        }
        
        if (!message.lu && message.expediteur.id !== 'current_doctor_id') {
          conversationsMap.get(userId).unreadCount++;
        }
      });
      
      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const data = await DoctorService.getConversation(userId);
      setSelectedConversation(data);
      
      // Marquer les messages comme lus
      const unreadMessages = data.messages.filter(msg => 
        !msg.lu && msg.expediteur.id !== 'current_doctor_id'
      );
      
      for (const message of unreadMessages) {
        await DoctorService.markMessageAsRead(message.id);
      }
      
      loadMessages(); // Recharger pour mettre à jour les compteurs
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await DoctorService.sendMessage({
        destinataireId: selectedConversation.user.id,
        contenu: newMessage,
        sujet: 'Message médical'
      });
      
      setNewMessage('');
      loadConversation(selectedConversation.user.id);
      loadMessages();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  return (
    <div className="doctor-messaging">
      <div className="messaging-layout">
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h3>Conversations</h3>
          </div>
          
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <div className="conversations-list">
              {conversations.map(conversation => (
                <div 
                  key={conversation.user.id}
                  className={`conversation-item ${selectedConversation?.user.id === conversation.user.id ? 'active' : ''}`}
                  onClick={() => loadConversation(conversation.user.id)}
                >
                  <div className="user-avatar">
                    {conversation.user.prenom[0]}{conversation.user.nom[0]}
                  </div>
                  <div className="conversation-info">
                    <div className="user-name">
                      {conversation.user.prenom} {conversation.user.nom}
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                    <div className="last-message">
                      {conversation.lastMessage.contenu.substring(0, 50)}...
                    </div>
                    <div className="message-time">
                      {new Date(conversation.lastMessage.dateEnvoi).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <h4>{selectedConversation.user.prenom} {selectedConversation.user.nom}</h4>
                <span className="user-role">{selectedConversation.user.role}</span>
              </div>

              <div className="messages-container">
                {selectedConversation.messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`message ${message.expediteur.id === 'current_doctor_id' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.contenu}</p>
                      <div className="message-time">
                        {new Date(message.dateEnvoi).toLocaleString()}
                        {message.expediteur.id === 'current_doctor_id' && (
                          <span className={`read-status ${message.lu ? 'read' : 'unread'}`}>
                            {message.lu ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="message-form">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  rows="3"
                  required
                />
                <button type="submit" disabled={!newMessage.trim()}>
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation">
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DoctorMessaging;