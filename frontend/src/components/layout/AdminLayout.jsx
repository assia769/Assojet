// // frontend/src/components/layout/AdminLayout.jsx
// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import '../../styles/components/admin.css';

// const AdminLayout = ({ children }) => {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//   };

//   const menuItems = [
//     {
//       path: '/admin',
//       label: 'Dashboard',
//       icon: '📊'
//     },
//     {
//       path: '/admin/users',
//       label: 'Utilisateurs',
//       icon: '👥'
//     },
//     {
//       path: '/admin/settings',
//       label: 'Paramètres',
//       icon: '⚙️'
//     }
//   ];

//   return (
//     <div className="admin-layout">
//       <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
//         <div className="sidebar-header">
//           <Link to="/" className="logo">
//             <h2>Cabinet Médical</h2>
//           </Link>
//           <button 
//             className="sidebar-toggle"
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//           >
//             {sidebarOpen ? '←' : '→'}
//           </button>
//         </div>
        
//         <nav className="sidebar-nav">
//           <ul>
//             {menuItems.map((item) => (
//               <li key={item.path}>
//                 <Link 
//                   to={item.path}
//                   className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
//                 >
//                   <span className="nav-icon">{item.icon}</span>
//                   {sidebarOpen && <span className="nav-label">{item.label}</span>}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>
        
//         <div className="sidebar-footer">
//           <Link to="/" className="back-to-site">
//             <span className="nav-icon">🏠</span>
//             {sidebarOpen && <span className="nav-label">Retour au site</span>}
//           </Link>
//         </div>
//       </aside>
      
//       <div className="admin-main">
//         <header className="admin-header">
//           <div className="header-left">
//             <h1>Administration</h1>
//           </div>
          
//           <div className="header-right">
//             <div className="admin-user">
//               <span className="user-info">
//                 {user.prenom} {user.nom}
//               </span>
//               <button onClick={handleLogout} className="logout-btn">
//                 Déconnexion
//               </button>
//             </div>
//           </div>
//         </header>
        
//         <main className="admin-content">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;

// frontend/src/components/layout/AdminLayout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Administration
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bonjour, {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Gestion des utilisateurs
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Paramètres système
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;