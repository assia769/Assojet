// frontend/src/components/layout/PatientLayout.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Calendar,
  FileText,
  MessageCircle,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Activity,
  Clock,
  Shield,
  Star,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Mon Tableau de Bord',
      href: '/patient',
      icon: Home,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      description: 'Vue d\'ensemble de ma santé'
    },
    {
      name: 'Prendre RDV',
      href: '/patient/book-appointment',
      icon: Plus,
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      description: 'Réserver une consultation'
    },
    {
      name: 'Mes Rendez-vous',
      href: '/patient/appointments',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      description: 'Gérer mes consultations'
    },
    {
      name: 'Mes Documents',
      href: '/patient/documents',
      icon: FileText,
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      description: 'Ordonnances et résultats'
    },
    {
      name: 'Messagerie',
      href: '/patient/messaging',
      icon: MessageCircle,
      gradient: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-50 to-purple-50',
      description: 'Communiquer avec mon médecin'
    },
    {
      name: 'Notifications',
      href: '/patient/notifications',
      icon: Bell,
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50',
      description: 'Alertes et rappels'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Styles CSS intégrés */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.6);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        @keyframes bounce-gentle {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-8px);
          }
          70% {
            transform: translateY(-4px);
          }
          90% {
            transform: translateY(-2px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite;
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        
        .nav-item {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .nav-item:hover::before {
          left: 100%;
        }
      `}</style>

      {/* Décoration d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-emerald-400/15 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-80 flex-col glass-morphism shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Header mobile */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg animate-pulse-glow">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ShifaTech
                </span>
                <p className="text-xs text-gray-600 font-medium">Votre santé, notre priorité</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Navigation mobile */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item group flex items-center p-4 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : 'bg-white/40 hover:bg-white/60 text-gray-700'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`p-3 rounded-xl mr-4 transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 shadow-inner' 
                      : `bg-gradient-to-br ${item.bgColor} group-hover:scale-110`
                  }`}>
                    <item.icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'text-white rotate-90' : 'text-gray-400 group-hover:translate-x-1'
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* Profil utilisateur mobile */}
          <div className="border-t border-white/20 p-6">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-white/20 to-purple-500/20 hover:from-white/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <div className="h-14 w-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-200">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-400 rounded-full border-2 border-white animate-bounce-gentle"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors duration-200">
                  Patient
                </p>
                <div className="flex items-center mt-1">
                  <Shield className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 font-medium">Compte vérifié</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              >
                <LogOut className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col z-40">
        <div className="flex flex-col flex-grow glass-morphism shadow-2xl">
          
          {/* Header desktop */}
          <div className="flex items-center h-24 px-8 border-b border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-lg animate-pulse-glow">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ShifaTech
                </span>
                <p className="text-sm text-gray-600 font-medium flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                  Votre santé, notre priorité
                </p>
              </div>
            </div>
          </div>
          

          {/* Navigation desktop */}
          <nav className="flex-1 px-6 py-8 space-y-4 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item card-hover group flex items-center p-5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl`
                      : 'bg-white/50 hover:bg-white/70 text-gray-700'
                  }`}
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    animation: 'slideInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className={`p-4 rounded-xl mr-5 transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 shadow-inner' 
                      : `bg-gradient-to-br ${item.bgColor} group-hover:scale-110 shadow-lg`
                  }`}>
                    <item.icon className={`h-7 w-7 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </p>
                    <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={`h-6 w-6 transition-all duration-200 ${
                    isActive ? 'text-white rotate-90' : 'text-gray-400 group-hover:translate-x-2 group-hover:text-purple-500'
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* Profil utilisateur desktop */}
          <div className="border-t border-white/20 p-8">
            <div className="flex items-center space-x-5 p-5 rounded-3xl bg-gradient-to-r from-white/30 to-purple-500/20 hover:from-white/40 hover:to-purple-500/30 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-200">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-400 rounded-full border-3 border-white animate-bounce-gentle flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors duration-200">
                  Patient Premium
                </p>
                <div className="flex items-center mt-2">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-xs text-green-600 font-medium">Compte vérifié</span>
                  <Star className="h-4 w-4 text-yellow-500 ml-3 mr-1" />
                  <span className="text-xs text-yellow-600 font-medium">5.0</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Link
                to="/patient/settings"
                className="flex w-full items-center px-5 py-3 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-2xl transition-all duration-200 group"
              >
                <Settings className="mr-4 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                Paramètres
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-5 py-3 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-2xl transition-all duration-200 group"
              >
                <LogOut className="mr-4 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-80">
        {/* Header mobile */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-6 glass-morphism border-b border-white/20 shadow-lg">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mon Espace Santé
            </h1>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <main className="relative">
          {/* Header desktop */}
          <div className="hidden lg:block">
            <div className="h-20 px-8 glass-morphism border-b border-white/20 shadow-lg">
              <div className="flex items-center justify-between h-full">
                <div className="animate-slideInUp">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Bonjour, {user?.prenom} ! 👋
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    {new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl shadow-lg animate-bounce-gentle">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">Santé Excellente</p>
                    <p className="text-xs text-green-600">Dernière visite: il y a 2 jours</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {/* AJOUTER LE BOUTON LOGOUT ICI */}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                    >
                      <LogOut className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                </div>
                </div>
              </div>
            </div>
          </div>
    

          
          <div className="p-6 lg:p-8">
            <div className="animate-slideInUp">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;