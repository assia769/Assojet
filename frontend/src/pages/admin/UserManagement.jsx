// frontend/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import '../../styles/components/admin.css';
import jsPDF from 'jspdf';


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // États séparés pour la visualisation et la modification
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Nouvel état pour l'ajout d'utilisateur
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    telephone: '',
    adresse: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Récupération des utilisateurs...');
      
      const response = await adminService.getUsers({
        page: currentPage,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        search: searchTerm
      });
      
      console.log('✅ Utilisateurs récupérés:', response);
      setUsers(response.users || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      setError('Erreur lors du chargement des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await adminService.deleteUser(userId);
        console.log('✅ Utilisateur supprimé');
        fetchUsers();
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  // Fonction pour voir le profil (lecture seule)
  const handleViewProfile = (user) => {
    setViewingUser(user);
  };

  // Fonction pour modifier l'utilisateur
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      role: user.role || 'patient',
      telephone: user.telephone || '',
      adresse: user.adresse || ''
    });
  };

  const handleUpdateUser = async () => {
    try {
      await adminService.updateUser(editingUser.id_u, formData);
      console.log('✅ Utilisateur mis à jour');
      setEditingUser(null);
      setFormData({});
      fetchUsers();
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'utilisateur:", error);
      alert('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  // Nouvelle fonction pour ouvrir le modal d'ajout
  const handleAddUser = () => {
    setNewUserData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
      telephone: '',
      adresse: ''
    });
    setIsAddingUser(true);
  };

  // Nouvelle fonction pour créer un utilisateur
  const handleCreateUser = async () => {
    // Validation
    if (!newUserData.nom || !newUserData.prenom || !newUserData.email || !newUserData.password) {
      alert('Veuillez remplir tous les champs obligatoires (nom, prénom, email, mot de passe)');
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (newUserData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      const userData = {
        nom: newUserData.nom,
        prenom: newUserData.prenom,
        email: newUserData.email,
        password: newUserData.password,
        role: newUserData.role,
        telephone: newUserData.telephone,
        adresse: newUserData.adresse
      };

      await adminService.createUser(userData);
      console.log('✅ Utilisateur créé avec succès');
      setIsAddingUser(false);
      setNewUserData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        telephone: '',
        adresse: ''
      });
      fetchUsers();
      alert('Utilisateur créé avec succès !');
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'utilisateur:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert('Erreur: ' + error.response.data.message);
      } else {
        alert('Erreur lors de la création de l\'utilisateur');
      }
    }
  };

const handleGenerateReport = async (userId) => {
  try {
    console.log('🔄 Génération du rapport PDF pour l\'utilisateur:', userId);
    const response = await adminService.generateUserReport(userId);
    
    if (response.success) {
      // Créer un nouveau document PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPosition = 30;
      
      // Fonction helper pour ajouter du texte avec retour à la ligne automatique
      const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.5);
      };

      // Fonction helper pour ajouter une nouvelle page si nécessaire
      const checkPageSpace = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = 30;
        }
      };

      // En-tête du document
      doc.setFillColor(41, 128, 185); // Bleu professionnel
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255); // Texte blanc
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('RAPPORT UTILISATEUR', pageWidth / 2, 16, { align: 'center' });
      
      // Réinitialiser la couleur du texte
      doc.setTextColor(0, 0, 0);
      yPosition = 40;

      // Date de génération
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 20;

      // Section : Informations personnelles
      checkPageSpace(60);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('INFORMATIONS PERSONNELLES', margin + 5, yPosition + 5);
      
      doc.setTextColor(0, 0, 0);
      yPosition += 25;

      // Informations utilisateur avec un meilleur formatage
      const userInfo = [
        { label: 'Nom complet', value: `${response.data.utilisateur.prenom} ${response.data.utilisateur.nom}` },
        { label: 'Adresse email', value: response.data.utilisateur.email },
        { label: 'Rôle dans le système', value: response.data.utilisateur.role.toUpperCase() },
        { label: 'Numéro de téléphone', value: response.data.utilisateur.telephone || 'Non renseigné' },
        { label: 'Adresse postale', value: response.data.utilisateur.adresse || 'Non renseignée' },
        { label: 'Date de création du compte', value: new Date(response.data.utilisateur.dateCreation).toLocaleDateString('fr-FR') },
        { label: 'Dernière connexion', value: response.data.utilisateur.derniereConnexion ? 
          new Date(response.data.utilisateur.derniereConnexion).toLocaleDateString('fr-FR') : 'Jamais connecté' }
      ];

      userInfo.forEach(info => {
        checkPageSpace(15);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text(`${info.label} :`, margin + 10, yPosition);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        yPosition = addWrappedText(info.value, margin + 60, yPosition, pageWidth - margin - 70, 10);
        yPosition += 8;
      });

      yPosition += 10;

      // Section : Statistiques (si disponibles)
      if (response.data.statistiques) {
        checkPageSpace(40);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('STATISTIQUES D\'UTILISATION', margin + 5, yPosition + 5);
        
        doc.setTextColor(0, 0, 0);
        yPosition += 25;

        // Afficher les statistiques de manière organisée
        Object.entries(response.data.statistiques).forEach(([key, value]) => {
          checkPageSpace(12);
          doc.setFont(undefined, 'bold');
          doc.setFontSize(11);
          doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)} :`, margin + 10, yPosition);
          
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);
          doc.text(String(value), margin + 80, yPosition);
          yPosition += 12;
        });
      }

      yPosition += 20;

      // Section : Résumé du profil
      checkPageSpace(50);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('RÉSUMÉ DU PROFIL', margin + 5, yPosition + 5);
      
      doc.setTextColor(0, 0, 0);
      yPosition += 25;

      // Générer un résumé personnalisé selon le rôle
      let resumeText = '';
      switch (response.data.utilisateur.role) {
        case 'patient':
          resumeText = `Ce patient est enregistré dans le système depuis le ${new Date(response.data.utilisateur.dateCreation).toLocaleDateString('fr-FR')}. Son profil est ${response.data.utilisateur.telephone ? 'complet avec' : 'incomplet, manquant'} les informations de contact téléphonique.`;
          break;
        case 'medecin':
          resumeText = `Ce médecin fait partie de l'équipe médicale depuis le ${new Date(response.data.utilisateur.dateCreation).toLocaleDateString('fr-FR')}. Son profil professionnel est configuré dans le système.`;
          break;
        case 'secretaire':
          resumeText = `Cette secrétaire assure les fonctions administratives depuis le ${new Date(response.data.utilisateur.dateCreation).toLocaleDateString('fr-FR')}. Elle dispose des accès nécessaires à la gestion des rendez-vous.`;
          break;
        case 'admin':
          resumeText = `Cet administrateur possède tous les privilèges système depuis le ${new Date(response.data.utilisateur.dateCreation).toLocaleDateString('fr-FR')}. Il peut gérer l'ensemble des utilisateurs et paramètres.`;
          break;
        default:
          resumeText = `Cet utilisateur est enregistré dans le système avec un rôle ${response.data.utilisateur.role}.`;
      }

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      yPosition = addWrappedText(resumeText, margin + 10, yPosition, pageWidth - 2 * margin - 20, 11);

      // Pied de page
      const addFooter = () => {
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Ce rapport a été généré automatiquement par le système de gestion.', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      };

      // Ajouter le pied de page à toutes les pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter();
      }

      // Télécharger le PDF
      const fileName = `rapport-${response.data.utilisateur.nom}-${response.data.utilisateur.prenom}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log('✅ Rapport PDF généré avec succès');
      alert('Rapport PDF généré et téléchargé avec succès !');
      
    }
  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport:', error);
    alert('Erreur lors de la génération du rapport PDF. Vérifiez la console.');
  }
};

  const filteredUsers = users.filter(user => 
    (user.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-content">
        <div className="loading-spinner">
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchUsers} className="action-btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Gestion des Utilisateurs</h1>
        <div className="header-actions">
          <p>Total: {users.length} utilisateur(s)</p>
          <button 
            onClick={handleAddUser}
            className="action-btn add-user"
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ➕ Ajouter un utilisateur
          </button>
        </div>
      </div>

      <div className="admin-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les rôles</option>
            <option value="patient">Patients</option>
            <option value="medecin">Médecins</option>
            <option value="secretaire">Secrétaires</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-data">
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id_u || user.id}>
                  <td>
                    <img
                      src={user.photo ? `http://localhost:5000${user.photo}` : '/default-avatar.png'}
                      alt={`${user.nom || ''} ${user.prenom || ''}`}
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '2px solid #ddd'
                      }}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  </td>
                  <td>{user.nom || 'N/A'}</td>
                  <td>{user.prenom || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role || 'N/A'}
                    </span>
                  </td>
                  <td>{user.telephone || 'Non renseigné'}</td>
                  <td>{user.adresse || 'Non renseignée'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewProfile(user)}
                        className="action-btn view"
                        title="Voir le profil"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="action-btn edit"
                        title="Modifier l'utilisateur"
                      >
                        ✏️ 
                      </button>
                      <button
                        onClick={() => handleGenerateReport(user.id_u || user.id)}
                        className="action-btn report"
                        title="Générer un rapport"
                      >
                        📄
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id_u || user.id)}
                        className="action-btn delete"
                        title="Supprimer l'utilisateur"
                      >
                        🗑️ 
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'ajout d'utilisateur */}
      {isAddingUser && (
        <div className="modal-overlay" onClick={() => setIsAddingUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un nouvel utilisateur</h2>
              <button 
                onClick={() => setIsAddingUser(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom <span style={{color: 'red'}}>*</span>:</label>
                  <input
                    type="text"
                    value={newUserData.nom}
                    onChange={(e) => setNewUserData({ ...newUserData, nom: e.target.value })}
                    placeholder="Nom de famille"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Prénom <span style={{color: 'red'}}>*</span>:</label>
                  <input
                    type="text"
                    value={newUserData.prenom}
                    onChange={(e) => setNewUserData({ ...newUserData, prenom: e.target.value })}
                    placeholder="Prénom"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email <span style={{color: 'red'}}>*</span>:</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="adresse@email.com"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Mot de passe <span style={{color: 'red'}}>*</span>:</label>
                  <input
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Minimum 6 caractères"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Confirmer le mot de passe <span style={{color: 'red'}}>*</span>:</label>
                  <input
                    type="password"
                    value={newUserData.confirmPassword}
                    onChange={(e) => setNewUserData({ ...newUserData, confirmPassword: e.target.value })}
                    placeholder="Retapez le mot de passe"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Rôle:</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                >
                  <option value="patient">Patient</option>
                  <option value="medecin">Médecin</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Téléphone:</label>
                <input
                  type="text"
                  value={newUserData.telephone}
                  onChange={(e) => setNewUserData({ ...newUserData, telephone: e.target.value })}
                  placeholder="Numéro de téléphone"
                />
              </div>
              
              <div className="form-group">
                <label>Adresse:</label>
                <input
                  type="text"
                  value={newUserData.adresse}
                  onChange={(e) => setNewUserData({ ...newUserData, adresse: e.target.value })}
                  placeholder="Adresse complète"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleCreateUser} 
                className="action-btn confirm"
              >
                ➕ Créer l'utilisateur
              </button>
              <button 
                onClick={() => setIsAddingUser(false)} 
                className="action-btn cancel"
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation du profil (lecture seule) */}
      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-content profile-view" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profil de {viewingUser.prenom} {viewingUser.nom}</h2>
              <button 
                onClick={() => setViewingUser(null)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="profile-display">
              <div className="profile-photo-large">
                <img
                  src={viewingUser.photo ? `http://localhost:5000${viewingUser.photo}` : '/default-avatar.png'}
                  alt={`${viewingUser.nom} ${viewingUser.prenom}`}
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '4px solid #007bff',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
              
              <div className="profile-info">
                <div className="info-section">
                  <h3>Informations personnelles</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Nom:</strong> 
                      <span>{viewingUser.nom || 'Non renseigné'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Prénom:</strong> 
                      <span>{viewingUser.prenom || 'Non renseigné'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong> 
                      <span>{viewingUser.email || 'Non renseigné'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Téléphone:</strong> 
                      <span>{viewingUser.telephone || 'Non renseigné'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Adresse:</strong> 
                      <span>{viewingUser.adresse || 'Non renseignée'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Rôle:</strong> 
                      <span className={`role-badge role-${viewingUser.role}`}>
                        {viewingUser.role || 'Non défini'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setViewingUser(null)} 
                className="action-btn cancel"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de l'utilisateur */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l'utilisateur</h2>
              <button 
                onClick={() => setEditingUser(null)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="user-profile">
              <div className="profile-photo">
                <img
                  src={editingUser.photo ? `http://localhost:5000${editingUser.photo}` : '/default-avatar.png'}
                  alt={`${editingUser.nom} ${editingUser.prenom}`}
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
              
              <div className="profile-form">
                <div className="form-group">
                  <label>Nom:</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
                
                <div className="form-group">
                  <label>Prénom:</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                </div>
                
                <div className="form-group">
                  <label>Rôle:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="patient">Patient</option>
                    <option value="medecin">Médecin</option>
                    <option value="secretaire">Secrétaire</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Téléphone:</label>
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="Téléphone"
                  />
                </div>
                
                <div className="form-group">
                  <label>Adresse:</label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="Adresse"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleUpdateUser} 
                className="action-btn confirm"
              >
                💾 Enregistrer les modifications
              </button>
              <button 
                onClick={() => setEditingUser(null)} 
                className="action-btn cancel"
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ⬅️ Précédent
          </button>
          <span className="pagination-info">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Suivant ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;