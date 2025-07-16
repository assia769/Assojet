
// frontend/src/components/layout/PublicLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, MessageCircle, LogIn, UserPlus, Menu, X } from 'lucide-react';
import logo1 from '../../uploads/photos/logo1.png';

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'À propos', path: '/about', icon: Info },
    { name: 'Avis', path: '/feedback', icon: MessageCircle },
    { name: 'Connexion', path: '/login', icon: LogIn },
    { name: 'Inscription', path: '/register', icon: UserPlus }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
           {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                  src={logo1}
                  alt="Logo Cabinet Médical"
                  className="w-20 h-20 object-cover rounded-full"
                />

              <span className="text-xl font-bold text-gray-800">ShifaTech</span>
            </Link>
          </div>


            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Cabinet Médical</h3>
              <p className="text-gray-300">
                Votre santé, notre priorité. Un service médical moderne et personnalisé.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-300">
                <p>123 Rue de la Santé, Casablanca</p>
                <p>+212 5 22 XX XX XX</p>
                <p>contact@cabinet-medical.ma</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Horaires</h3>
              <div className="space-y-2 text-gray-300">
                <p>Lundi - Vendredi: 8h - 18h</p>
                <p>Samedi: 8h - 14h</p>
                <p>Dimanche: Fermé</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Cabinet Médical. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;