
// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';

// Pages publiques
import Home from './pages/Home';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import Register from './pages/Register';

// Pages Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings';

// Pages Secrétaire
import SecretaryDashboard from './pages/secretary/SecretaryDashboard';
import AppointmentManagement from './pages/secretary/AppointmentManagement';
import PatientManagement from './pages/secretary/PatientManagement';
import InvoiceManagement from './pages/secretary/InvoiceManagement';

// Pages Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import AppointmentBooking from './pages/patient/AppointmentBooking';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientDocuments from './pages/patient/PatientDocuments';
import PatientMessaging from './pages/patient/PatientMessaging';
import PatientNotifications from './pages/patient/PatientNotifications';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import SecretaryLayout from './components/layout/SecretaryLayout';
import PatientLayout from './components/layout/PatientLayout';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'secretaire') {
      return <Navigate to="/secretary" replace />;
    } else if (user.role === 'patient') {
      return <Navigate to="/patient" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/feedback" element={<PublicLayout><Feedback /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

          {/* Routes Admin protégées */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminLayout><SystemSettings /></AdminLayout></ProtectedRoute>} />

          {/* Routes Secrétaire protégées */}
          <Route path="/secretary" element={<ProtectedRoute requiredRole="secretaire"><SecretaryLayout><SecretaryDashboard /></SecretaryLayout></ProtectedRoute>} />
          <Route path="/secretary/appointments" element={<ProtectedRoute requiredRole="secretaire"><SecretaryLayout><AppointmentManagement /></SecretaryLayout></ProtectedRoute>} />
          <Route path="/secretary/patients" element={<ProtectedRoute requiredRole="secretaire"><SecretaryLayout><PatientManagement /></SecretaryLayout></ProtectedRoute>} />
          <Route path="/secretary/invoices" element={<ProtectedRoute requiredRole="secretaire"><SecretaryLayout><InvoiceManagement /></SecretaryLayout></ProtectedRoute>} />

          {/* Routes Patient protégées */}
          <Route path="/patient" element={<ProtectedRoute requiredRole="patient"><PatientLayout><PatientDashboard /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/book-appointment" element={<ProtectedRoute requiredRole="patient"><PatientLayout><AppointmentBooking /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute requiredRole="patient"><PatientLayout><PatientAppointments /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/documents" element={<ProtectedRoute requiredRole="patient"><PatientLayout><PatientDocuments /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/messaging" element={<ProtectedRoute requiredRole="patient"><PatientLayout><PatientMessaging /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/notifications" element={<ProtectedRoute requiredRole="patient"><PatientLayout><PatientNotifications /></PatientLayout></ProtectedRoute>} />

          {/* Tableau de bord général */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PublicLayout>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                      Tableau de Bord Patient
                    </h1>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-gray-600">
                        Bienvenue dans votre espace personnel.
                      </p>
                    </div>
                  </div>
                </PublicLayout>
              </ProtectedRoute>
            } 
          />

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
};

export default App;
