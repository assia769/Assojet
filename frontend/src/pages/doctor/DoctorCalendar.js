// DoctorCalendar.js
import React, { useState, useEffect } from 'react';
import DoctorService from '../../services/doctorService';

const DoctorCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('week'); // 'day', 'week', 'month'

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, view]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const startDate = getStartDate();
      const endDate = getEndDate();
      const data = await DoctorService.getAppointments(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setAppointments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(selectedDate);
    if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day + 1); // Début de semaine (lundi)
    } else if (view === 'month') {
      date.setDate(1); // Premier jour du mois
    }
    return date;
  };

  const getEndDate = () => {
    const date = new Date(selectedDate);
    if (view === 'day') {
      return date;
    } else if (view === 'week') {
      date.setDate(date.getDate() + 6); // Fin de semaine
    } else if (view === 'month') {
      date.setMonth(date.getMonth() + 1, 0); // Dernier jour du mois
    }
    return date;
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await DoctorService.updateAppointmentStatus(appointmentId, status);
      loadAppointments();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const getAppointmentsByDate = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.dateRendezVous);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsByDate(selectedDate);
    
    return (
      <div className="day-view">
        <h3>{selectedDate.toLocaleDateString()}</h3>
        <div className="time-slots">
          {Array.from({ length: 12 }, (_, i) => {
            const hour = 8 + i;
            const timeSlot = `${hour}:00`;
            const slotAppointments = dayAppointments.filter(apt => 
              new Date(apt.dateRendezVous).getHours() === hour
            );

            return (
              <div key={hour} className="time-slot">
                <div className="time">{timeSlot}</div>
                <div className="appointments">
                  {slotAppointments.map(apt => (
                    <div key={apt.id} className={`appointment ${apt.statut}`}>
                      <div className="patient-name">
                        {apt.patient.prenom} {apt.patient.nom}
                      </div>
                      <div className="appointment-type">{apt.typeConsultation}</div>
                      <div className="appointment-actions">
                        <select 
                          value={apt.statut}
                          onChange={(e) => updateAppointmentStatus(apt.id, e.target.value)}
                        >
                          <option value="programme">Programmé</option>
                          <option value="en_cours">En cours</option>
                          <option value="termine">Terminé</option>
                          <option value="annule">Annulé</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = getStartDate();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });

    return (
      <div className="week-view">
        <div className="week-header">
          {weekDays.map(date => (
            <div key={date.toISOString()} className="day-header">
              <div className="day-name">
                {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
              </div>
              <div className="day-number">{date.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="week-content">
          {weekDays.map(date => (
            <div key={date.toISOString()} className="day-column">
              {getAppointmentsByDate(date).map(apt => (
                <div key={apt.id} className={`appointment ${apt.statut}`}>
                  <div className="time">
                    {new Date(apt.dateRendezVous).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="patient">
                    {apt.patient.prenom} {apt.patient.nom}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="doctor-calendar">
      <div className="calendar-header">
        <h2>Calendrier</h2>
        <div className="calendar-controls">
          <div className="view-selector">
            <button 
              className={view === 'day' ? 'active' : ''}
              onClick={() => setView('day')}
            >
              Jour
            </button>
            <button 
              className={view === 'week' ? 'active' : ''}
              onClick={() => setView('week')}
            >
              Semaine
            </button>
          </div>
          
          <div className="date-navigation">
            <button onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - (view === 'day' ? 1 : 7));
              setSelectedDate(newDate);
            }}>
              ‹
            </button>
            <span className="current-period">
              {view === 'day' 
                ? selectedDate.toLocaleDateString()
                : `Semaine du ${getStartDate().toLocaleDateString()}`
              }
            </span>
            <button onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + (view === 'day' ? 1 : 7));
              setSelectedDate(newDate);
            }}>
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-content">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          view === 'day' ? renderDayView() : renderWeekView()
        )}
      </div>
    </div>
  );
};
export default DoctorCalendar;