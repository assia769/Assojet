// frontend/src/components/layout/DoctorLayout.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Pill,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronRight,
  Activity
} from 'lucide-react';

const DoctorLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Tableau de bord', href: '/doctor', icon: Stethoscope, color: 'from-blue-500 to-blue-600' },
    { name: 'Patients', href: '/doctor/patients', icon: Users, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Calendrier', href: '/doctor/calendar', icon: Calendar, color: 'from-blue-600 to-cyan-600' },
    { name: 'Consultations', href: '/doctor/consultation', icon: FileText, color: 'from-green-500 to-green-600' },
    // { name: 'Dossiers médicaux', href: '/doctor/medical-records', icon: FileText, color: 'from-teal-500 to-teal-600' },
    { name: 'Ordonnances', href: '/doctor/prescriptions', icon: Pill, color: 'from-blue-500 to-indigo-600' },
    { name: 'Messagerie', href: '/doctor/messaging', icon: MessageSquare, color: 'from-emerald-600 to-cyan-600' },
    { name: 'Statistiques', href: '/doctor/statistics', icon: BarChart3, color: 'from-green-600 to-emerald-600' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Styles CSS intégrés */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0,-10px,0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0,-5px,0);
          }
          90% {
            transform: translate3d(0,-1px,0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        
        .animate-pulse-custom {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce 2s infinite;
        }
        
        .nav-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-item:hover {
          transform: translateX(8px) scale(1.02);
        }
        
        .nav-item.active {
          transform: translateX(8px);
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .gradient-border {
          position: relative;
        }
        
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(45deg, #3b82f6, #10b981);
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
        }
      `}</style>

      {/* Sidebar mobile */}
      <div className={`fixed inset-0 flex z-50 md:hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full glass-effect shadow-2xl transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center px-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl shadow-lg animate-bounce-gentle">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    ShifaTech
                  </span>
                  <p className="text-xs text-gray-500 font-medium">Système Médical</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="px-3 space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item group flex items-center px-3 py-4 text-sm font-medium rounded-xl ${
                      isActive
                        ? 'active bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 shadow-inner' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-emerald-100'
                    }`}>
                      <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
                      isActive 
                        ? 'text-white rotate-90' 
                        : 'text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1'
                    }`} />
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User Profile */}
          <div className="flex-shrink-0 border-t border-gray-200/50 p-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-emerald-50 transition-all duration-300">
              <div className="relative">
                {/* <img
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-200 transition-transform duration-200 hover:scale-105"
                  src={user?.photo || '/api/placeholder/48/48'}
                  alt=""
                /> */}
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
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse-custom"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Dr. {user?.nom} {user?.prenom}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.specialite || 'Médecin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40">
        <div className="flex-1 flex flex-col min-h-0 glass-effect shadow-xl">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl shadow-lg animate-bounce-gentle">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    ShifaTech
                  </span>
                  <p className="text-xs text-gray-500 font-medium">Système Médical Intelligent</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'active bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                    style={{ 
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className={`p-2 rounded-lg mr-4 transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 shadow-inner' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-emerald-100'
                    }`}>
                      <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
                      isActive 
                        ? 'text-white rotate-90' 
                        : 'text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1'
                    }`} />
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User Profile */}
          <div className="flex-shrink-0 border-t border-gray-200/50 p-6">
            <div className="gradient-border flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer group">
              <div className="relative">
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
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse-custom"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                  Dr. {user?.nom} {user?.prenom}
                </p>
                <p className="text-xs text-gray-600 group-hover:text-emerald-600 transition-colors duration-200">
                  {user?.specialite || 'Médecin'}
                </p>
                <div className="flex items-center mt-1">
                  <Activity className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 font-medium">En ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72 flex flex-col flex-1">
        {/* Mobile menu button */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="h-12 w-12 inline-flex items-center justify-center rounded-xl glass-effect text-gray-600 hover:text-gray-900 shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Top bar */}
        <div className="sticky top-0 z-30 flex-shrink-0 flex h-20 glass-effect shadow-sm border-b border-gray-200/50">
          <div className="flex-1 px-6 flex justify-between items-center">
            {/* Welcome message */}
            <div className="flex items-center space-x-4 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Bonjour, Dr. {user?.prenom} 👋
                </h1>
                <p className="text-sm text-gray-600">
                  Voici un aperçu de votre journée • {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 group"
              >
                <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative py-8">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="animate-fadeIn">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;