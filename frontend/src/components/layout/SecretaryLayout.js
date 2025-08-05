import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SecretaryLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { 
      path: '/secretary', 
      label: 'Tableau de bord', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      path: '/secretary/appointments', 
      label: 'Rendez-vous', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-emerald-600'
    },
    { 
      path: '/secretary/patients', 
      label: 'Patients', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      path: '/secretary/invoices', 
      label: 'Factures', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 via-cyan-50 to-emerald-100">
      {/* Header avec navigation horizontale */}
      <header className="relative bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/8 via-purple-500/8 via-cyan-500/8 to-emerald-500/8"></div>
        
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et branding */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25 animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full animate-bounce"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-700 to-purple-600 bg-clip-text text-transparent">
                  ShifaTech
                </h1>
                <p className="text-sm text-slate-600 font-medium">Interface Secrétaire</p>
              </div>
            </div>

            {/* Navigation principale horizontale */}
            <nav className="hidden md:flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-white/30 shadow-inner">
              {menuItems.map((item) => {
                const isItemActive = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      isItemActive 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-500/30` 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/80 hover:shadow-md'
                    }`}
                  >
                    <span className={`${isItemActive ? 'animate-pulse' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                    {isItemActive && (
                      <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2.5 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 text-slate-600 hover:text-pink-600 hover:bg-pink-50/80 transition-all duration-300 hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.94-1.97a1 1 0 011.42.89v18.52a1 1 0 01-1.42.89l-3.94-1.97a1 1 0 00-.9 0l-3.94 1.97a1 1 0 01-1.42-.89V1.74a1 1 0 011.42-.89l3.94 1.97a1 1 0 00.9 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce"></span>
              </button>


 

              {/* Profil utilisateur */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 p-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg animate-pulse">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-700">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown utilisateur */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-200/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.prenom?.[0]}{user?.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user?.prenom} {user?.nom}</p>
                          <p className="text-sm text-slate-600">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-purple-50/80 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">Paramètres</span>
                      </button>
                      {/* <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 mx-2 mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-bold">DÉCONNEXION</span>
                      </button> */}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>
          <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 mx-2 mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-bold">DÉCONNEXION</span>
                      </button>
        </div>
      </header>

      {/* Zone de bienvenue */}
      <div className="px-6 py-6">
        <div className="bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          {/* Animations de fond */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-16 right-8 w-16 h-16 bg-white/50 rounded-full animate-bounce delay-75"></div>
            <div className="absolute bottom-8 left-16 w-12 h-12 bg-white/30 rounded-full animate-ping delay-150"></div>
            <div className="absolute bottom-16 right-16 w-8 h-8 bg-white/40 rounded-full animate-pulse delay-300"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-semibold">
                  {new Date().toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                Bonjour, {user?.prenom} ! 👋
              </h2>
              <p className="text-xl text-white/90 mb-1">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-white/80">
                Prêt(e) à gérer une nouvelle journée de soins exceptionnels
              </p>
            </div>
            
            <div className="hidden lg:block">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {menuItems.find(item => item.path === location.pathname)?.label || 'Tableau de bord'}
                </h3>
                <p className="text-white/80 text-sm">
                  Gestion et suivi des activités de secrétariat
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="px-6 pb-6">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 min-h-[600px] p-8">
          {children}
        </div>
      </main>

      {/* Navigation mobile */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-2 z-50">
        <div className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isItemActive = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 ${
                  isItemActive 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105` 
                    : 'text-slate-600 hover:scale-105'
                }`}
              >
                <span className={isItemActive ? 'animate-pulse' : ''}>{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecretaryLayout;