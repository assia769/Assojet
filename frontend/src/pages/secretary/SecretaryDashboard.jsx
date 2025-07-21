// frontend/src/pages/secretary/SecretaryDashboard.jsx
import React from 'react';
import DashboardStats from './DashboardStats';
import UpcomingAppointments from './UpcomingAppointments';
import QuickActions from './QuickActions';
import CalendarWidget from './CalendarWidget';

const SecretaryDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Secrétaire
          </h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble des activités de la clinique
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prochains rendez-vous */}
          <div>
            <UpcomingAppointments />
          </div>

          {/* Calendrier widget */}
          <div>
            <CalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;