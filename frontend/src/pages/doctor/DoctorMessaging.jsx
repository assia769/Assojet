import React, { useState, useEffect } from 'react';
import DoctorService from '../../services/doctorService';
import './DoctorMessaging.css';

const DoctorMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNewConversation, setShowNewConversation] = useState(false);

  useEffect(() => {
    // Récupérer l'utilisateur actuel depuis le localStorage ou le contexte
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    
    if (user.id) {
      loadMessages();
    }
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Chargement des messages...');
      const response = await DoctorService.getMessages();
      
      const messagesData = response.messages || response.data || [];
      setMessages(messagesData);
      
      console.log('✅ Messages chargés:', messagesData);
      
      // Grouper les messages par conversation
      const conversationsMap = new Map();
      
      messagesData.forEach(message => {
        // Déterminer l'autre utilisateur dans la conversation
        const otherUser = message.expediteur.id === currentUser?.id 
          ? message.destinataire 
          : message.expediteur;
        
        const userId = otherUser.id;
        
        if (!conversationsMap.has(userId)) {
          conversationsMap.set(userId, {
            user: otherUser,
            lastMessage: message,
            unreadCount: 0,
            messages: []
          });
        }
        
        const conversation = conversationsMap.get(userId);
        
        // Mettre à jour le dernier message si plus récent
        if (new Date(message.dateEnvoi) > new Date(conversation.lastMessage.dateEnvoi)) {
          conversation.lastMessage = message;
        }
        
        // Compter les messages non lus (reçus par le médecin)
        if (!message.lu && message.destinataire.id === currentUser?.id) {
          conversation.unreadCount++;
        }
        
        conversation.messages.push(message);
      });
      
      // Trier les conversations par date du dernier message
      const sortedConversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessage.dateEnvoi) - new Date(a.lastMessage.dateEnvoi));
      
      setConversations(sortedConversations);
      console.log('✅ Conversations organisées:', sortedConversations);
      
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId) => {
    try {
      console.log('💬 Chargement conversation avec:', userId);
      
      const response = await DoctorService.getConversation(userId);
      setSelectedConversation(response);
      setShowNewConversation(false);
      
      console.log('✅ Conversation chargée:', response);
      
      // Marquer les messages non lus comme lus
      const unreadMessages = response.messages.filter(msg => 
        !msg.lu && msg.destinataire.id === currentUser?.id
      );
      
      for (const message of unreadMessages) {
        try {
          await DoctorService.markMessageAsRead(message.id);
        } catch (error) {
          console.error('❌ Erreur marquage lu:', error);
        }
      }
      
      // Recharger les messages pour mettre à jour les compteurs
      setTimeout(() => loadMessages(), 500);
      
    } catch (error) {
      console.error('❌ Erreur chargement conversation:', error);
      setError('Erreur lors du chargement de la conversation');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      console.log('✉️ Envoi message à:', selectedConversation.user);
      console.log('✉️ ID destinataire:', selectedConversation.user.id || selectedConversation.user.id_u);
      
      // S'assurer d'avoir le bon ID - priorité à id, puis id_u en fallback
      const destinataireId = selectedConversation.user.id || selectedConversation.user.id_u;
      
      if (!destinataireId) {
        console.error('❌ Aucun ID destinataire trouvé:', selectedConversation.user);
        setError('Erreur: destinataire non valide');
        return;
      }
      
      await DoctorService.sendMessage({
        destinataireId: destinataireId,
        contenu: newMessage.trim(),
        sujet: 'Message médical'
      });
      
      setNewMessage('');
      
      // Recharger la conversation et les messages
      await loadConversation(destinataireId);
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const users = await DoctorService.searchUsers(query);
      setSearchResults(users || []);
    } catch (error) {
      console.error('❌ Erreur recherche:', error);
    }
  };

  const startNewConversation = (user) => {
    // S'assurer que l'objet user a la bonne structure
    const normalizedUser = {
      id: user.id_u, // Utiliser id_u de la recherche
      id_u: user.id_u, // Garder aussi id_u pour compatibilité
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      photo: user.photo
    };
    
    console.log('🆕 Nouvelle conversation avec:', normalizedUser);
    
    setSelectedConversation({
      user: normalizedUser,
      messages: []
    });
    setShowNewConversation(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Moins de 24h
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className="doctor-messaging">
      <div className="messaging-layout">
        {/* Sidebar des conversations */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h3>Messages</h3>
            <button 
              className="new-conversation-btn"
              onClick={() => setShowNewConversation(!showNewConversation)}
            >
              + Nouveau
            </button>
          </div>
          
          {/* Nouvelle conversation */}
          {showNewConversation && (
            <div className="new-conversation-panel">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="search-input"
              />
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div 
                      key={user.id_u}
                      className="search-result-item"
                      onClick={() => startNewConversation(user)}
                    >
                      <div className="user-avatar">
                        {user.prenom[0]}{user.nom[0]}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.prenom} {user.nom}</div>
                        <div className="user-role">{user.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Liste des conversations */}
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Chargement...</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>Aucune conversation</p>
                </div>
              ) : (
                conversations.map(conversation => (
                  <div 
                    key={conversation.user.id}
                    className={`conversation-item ${selectedConversation?.user.id === conversation.user.id ? 'active' : ''}`}
                    onClick={() => loadConversation(conversation.user.id)}
                  >
                    <div className="user-avatar">
                      {conversation.user.photo ? (
                        <img src={conversation.user.photo} alt="Avatar" />
                      ) : (
                        <span>{conversation.user.prenom?.[0]}{conversation.user.nom?.[0]}</span>
                      )}
                    </div>
                    <div className="conversation-info">
                      <div className="user-name">
                        {conversation.user.prenom} {conversation.user.nom}
                        {conversation.unreadCount > 0 && (
                          <span className="unread-badge">{conversation.unreadCount}</span>
                        )}
                      </div>
                      <div className="last-message">
                        {conversation.lastMessage.contenu.length > 50 
                          ? conversation.lastMessage.contenu.substring(0, 50) + '...'
                          : conversation.lastMessage.contenu
                        }
                      </div>
                      <div className="message-time">
                        {formatMessageTime(conversation.lastMessage.dateEnvoi)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Zone de chat */}
        <div className="chat-area">
          {error && (
            <div className="error-message">
              ⚠️ {error}
              <button onClick={() => setError('')}>×</button>
            </div>
          )}
          
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="user-info">
                  <h4>{selectedConversation.user.prenom} {selectedConversation.user.nom}</h4>
                  <span className="user-role">{selectedConversation.user.role}</span>
                </div>
              </div>

              <div className="messages-container">
                {selectedConversation.messages.length === 0 ? (
                  <div className="no-messages">
                    <p>Aucun message dans cette conversation</p>
                  </div>
                ) : (
                  selectedConversation.messages
                    .sort((a, b) => new Date(a.dateEnvoi) - new Date(b.dateEnvoi))
                    .map(message => (
                      <div 
                        key={message.id} 
                        className={`message ${message.expediteur.id === currentUser?.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.contenu}</p>
                          <div className="message-time">
                            {formatMessageTime(message.dateEnvoi)}
                            {message.expediteur.id === currentUser?.id && (
                              <span className={`read-status ${message.lu ? 'read' : 'unread'}`}>
                                {message.lu ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
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
              <div className="empty-state">
                <h3>Messagerie médicale</h3>
                <p>Sélectionnez une conversation pour commencer à discuter</p>
                <button onClick={() => setShowNewConversation(true)}>
                  Nouvelle conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessaging;