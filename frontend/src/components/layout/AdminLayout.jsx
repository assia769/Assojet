// frontend/src/components/layout/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components/adminLay.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Gérer l'effet de scroll sur le header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    const name = user?.name || user?.nom || user?.email || '';
    
    if (user?.nom && user?.prenom) {
      return `${user.nom.charAt(0)}${user.prenom.charAt(0)}`.toUpperCase();
    }
    
    return name.charAt(0).toUpperCase() || '?';
  };

  // Fonction pour obtenir le nom d'affichage
  const getDisplayName = () => {
    if (user?.nom && user?.prenom) {
      return `${user.prenom} ${user.nom}`;
    }
    return user?.name || user?.email || 'Utilisateur';
  };

  // Fonction pour vérifier si un lien est actif
  const isActiveLink = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Navigation items
  const navigationItems = [
    {
      to: '/admin',
      icon: '📊',
      label: 'Tableau de bord'
    },
    {
      to: '/admin/users',
      icon: '👥',
      label: 'Gestion des utilisateurs'
    },
    
    {
      to: '/admin/settings',
      icon: '⚙️',
      label: 'Paramètres système'
    }
  ];

  return (
    <div className="admin-layout">
      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Header */}
      <header className={`admin-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="header-content">
            <div className="header-title">
              <h1>Administration</h1>
            </div>
            
            <div className="header-actions">
              <div className="user-info">
                <div className="user-avatar">
                  {getUserInitials()}
                </div>
                <span className="user-name">
                  {getDisplayName()}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            ⚡ Admin
          </div>
        </div>
        
        <div className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map((item, index) => (
              <li key={item.to} className="nav-item">
                <Link
                  to={item.to}
                  className={`nav-link ${isActiveLink(item.to) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Section additionnelle dans la sidebar */}
          <div style={{ 
            padding: '1.5rem 1rem 1rem', 
            marginTop: 'auto',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              🎯 Dashboard v2.0
            </div>
            <div>
              Connecté en tant que <strong style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {user?.role || 'Admin'}
              </strong>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="admin-main">
        <div className="main-content">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-998 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ zIndex: 998 }}
        />
      )}
    </div>
  );
};

export default AdminLayout;