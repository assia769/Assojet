// frontend/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import '../../styles/components/admin.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        page: currentPage,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        search: searchTerm
      });
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      adresse: user.adresse
    });
  };

  const handleUpdateUser = async () => {
    try {
      await adminService.updateUser(selectedUser.id_u, formData);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Gestion des Utilisateurs</h1>
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
        <table className="admin-table">
          <thead>
            <tr>
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
              <tr key={user.id_u}>
                <td>{user.nom}</td>
                <td>{user.prenom}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.telephone}</td>
                <td>{user.adresse}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="action-btn activate"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id_u)}
                      className="action-btn delete"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="edit-form">
          <h2>Modifier l'utilisateur</h2>
          <input
            type="text"
            placeholder="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          />
          <input
            type="text"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="patient">Patient</option>
            <option value="medecin">Médecin</option>
            <option value="secretaire">Secrétaire</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="text"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Adresse"
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
          />
          <button onClick={handleUpdateUser} className="action-btn confirm">
            Enregistrer
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Précédent
          </button>
          <span className="pagination-info">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
