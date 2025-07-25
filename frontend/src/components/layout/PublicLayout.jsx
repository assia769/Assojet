import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, MessageCircle, LogIn, UserPlus, Menu, X, MapPin, Phone, Mail, Clock } from 'lucide-react';
import logo1 from '../../uploads/photos/logo1.png';

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'À propos', path: '/about', icon: Info },
    { name: 'Avis', path: '/feedback', icon: MessageCircle },
    { name: 'Connexion', path: '/login', icon: LogIn },
    { name: 'Inscription', path: '/register', icon: UserPlus }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Animated particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrollY > 50 
            ? 'bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-2xl' 
            : 'bg-white/5 backdrop-blur-sm shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo avec votre image */}
            <div className="flex items-center group">
              <Link to="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full blur-lg "></div>
                  <img
                    src={logo1}
                    alt="Logo Cabinet Médical"
                    className="relative w-16 h-16 object-cover rounded-full  transform group-hover:scale-110 transition-all duration-300 shadow-2xl"
                  />
                </div>
                <div>
                  <span className="text-2xl font-black bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                    ShifaTech
                  </span>
                  <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                        active
                          ? 'text-white bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/25'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 opacity-75 blur-sm"></div>
                      )}
                      <Icon size={18} className="relative z-10" />
                      <span className="relative z-10">{item.name}</span>
                      {!active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      )}
                    </Link>
                    {active && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-bounce"></div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 rounded-2xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isMobileMenuOpen ? <X size={24} className="relative z-10" /> : <Menu size={24} className="relative z-10" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white/10 backdrop-blur-2xl border-t border-white/20 m-4 rounded-2xl p-4">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 mb-2 last:mb-0 ${
                    active
                      ? 'text-white bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                    opacity: isMobileMenuOpen ? 1 : 0
                  }}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content - Conteneur pour vos pages */}
      <main className="flex-1 relative z-10 min-h-screen">
        <div className="bg-white/5 backdrop-blur-sm min-h-screen">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10">
        <div className="bg-gradient-to-r from-slate-900/90 to-purple-900/90 backdrop-blur-2xl border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={logo1}
                    alt="Logo Cabinet Médical"
                    className="w-12 h-12 object-cover rounded-xl border border-white/20 shadow-lg"
                  />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    Cabinet Médical
                  </h3>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Votre santé, notre priorité. Un service médical moderne et personnalisé 
                  avec les dernières technologies.
                </p>
                <div className="flex space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <div className="w-5 h-5 bg-gradient-to-r from-emerald-400 to-blue-500 rounded group-hover:scale-110 transition-transform duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-emerald-400" />
                  Contact
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, text: "123 Rue de la Santé, Casablanca" },
                    { icon: Phone, text: "+212 5 22 XX XX XX" },
                    { icon: Mail, text: "contact@cabinet-medical.ma" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors duration-300 cursor-pointer group">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all duration-300">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-emerald-400" />
                  Horaires
                </h3>
                <div className="space-y-3">
                  {[
                    { day: "Lundi - Vendredi", time: "8h - 18h" },
                    { day: "Samedi", time: "8h - 14h" },
                    { day: "Dimanche", time: "Fermé" }
                  ].map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <span className="text-white/70">{schedule.day}</span>
                      <span className="text-emerald-400 font-semibold">{schedule.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 mt-12 pt-8">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/5 rounded-2xl backdrop-blur-sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70">© 2024 Cabinet Médical. Tous droits réservés.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style >{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;