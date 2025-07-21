// frontend/src/components/secretary/CalendarWidget.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/secretary/calendar?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du calendrier');
      }

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erreur fetchCalendarData:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Ajouter les jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month, -i);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Ajouter les jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const isToday = currentDay.toDateString() === new Date().toDateString();
      
      days.push({
        date: currentDay,
        isCurrentMonth: true,
        isToday
      });
    }

    // Compléter la grille avec les jours du mois suivant
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.date_rend.split('T')[0] === dateString
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateAppointments = getAppointmentsForDate(selectedDate);
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Calendrier
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <h4 className="text-base font-medium text-gray-700 min-w-[140px] text-center">
            {formatMonthYear(currentDate)}
          </h4>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="mb-6">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.date);
            const isSelected = day.date.toDateString() === selectedDate.toDateString();
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  relative p-2 h-10 text-sm rounded-lg transition-colors
                  ${!day.isCurrentMonth 
                    ? 'text-gray-300 hover:bg-gray-50' 
                    : day.isToday 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : isSelected
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {day.date.getDate()}
                {dayAppointments.length > 0 && (
                  <div className={`
                    absolute bottom-1 right-1 w-2 h-2 rounded-full
                    ${day.isToday ? 'bg-white' : 'bg-blue-500'}
                  `}>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rendez-vous du jour sélectionné */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          {selectedDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </h4>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : selectedDateAppointments.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Aucun rendez-vous ce jour
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedDateAppointments.map((appointment) => (
              <div
                key={appointment.id_r}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formatTime(appointment.heure)} - {appointment.patient_prenom} {appointment.patient_nom}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Dr. {appointment.medecin_nom} {appointment.medecin_prenom}
                  </p>
                  {appointment.motif && (
                    <p className="text-xs text-gray-400 truncate">
                      {appointment.motif}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${appointment.statut === 'confirmé' 
                      ? 'bg-green-100 text-green-800' 
                      : appointment.statut === 'en attente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {appointment.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;