
// Remplacez le composant DoctorCalendar.js par cette version corrigée
import React, { useState, useEffect } from 'react';
import DoctorService from '../../services/doctorService';
import './DoctorCalendar.css';

const DoctorCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('week'); // 'day', 'week', 'month'

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, view]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      console.log('🔄 Chargement RDV:', { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] });
      
      const data = await DoctorService.getAppointments(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      console.log('✅ RDV chargés:', data);
      setAppointments(data || []);
      
    } catch (error) {
      console.error('❌ Erreur chargement RDV:', error);
      setError('Erreur lors du chargement des rendez-vous');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(selectedDate);
    if (view === 'week') {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lundi
      date.setDate(diff);
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
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? 0 : 7); // Dimanche
      date.setDate(diff);
    } else if (view === 'month') {
      date.setMonth(date.getMonth() + 1, 0); // Dernier jour du mois
    }
    return date;
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await DoctorService.updateAppointmentStatus(appointmentId, status);
      await loadAppointments(); // Recharger les données
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const getAppointmentsByDate = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.dateRendezVous);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'programme': return '#4CAF50';
      case 'en_cours': return '#FF9800';
      case 'termine': return '#2196F3';
      case 'annule': return '#F44336';
      default: return '#757575';
    }
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsByDate(selectedDate);
    
    return (
      <div className="day-view">
        <h3>{selectedDate.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</h3>
        
        {dayAppointments.length === 0 ? (
          <div className="no-appointments">
            <p>Aucun rendez-vous pour cette journée</p>
          </div>
        ) : (
          <div className="time-slots">
            {Array.from({ length: 12 }, (_, i) => {
              const hour = 8 + i;
              const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
              const slotAppointments = dayAppointments.filter(apt => 
                new Date(apt.dateRendezVous).getHours() === hour
              );

              return (
                <div key={hour} className="time-slot">
                  <div className="time">{timeSlot}</div>
                  <div className="appointments">
                    {slotAppointments.map(apt => (
                      <div 
                        key={apt.id} 
                        className={`appointment ${apt.statut || 'programme'}`}
                        style={{ borderLeft: `4px solid ${getStatusColor(apt.statut)}` }}
                      >
                        <div className="patient-name">
                          {apt.patient.prenom} {apt.patient.nom}
                        </div>
                        <div className="appointment-type">
                          {apt.typeConsultation || 'Consultation'}
                        </div>
                        <div className="appointment-time">
                          {new Date(apt.dateRendezVous).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="appointment-actions">
                          <select 
                            value={apt.statut || 'programme'}
                            onChange={(e) => updateAppointmentStatus(apt.id, e.target.value)}
                            className="status-select"
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
        )}
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
          {weekDays.map(date => {
            const dayAppointments = getAppointmentsByDate(date);
            return (
              <div key={date.toISOString()} className="day-column">
                {dayAppointments.length === 0 ? (
                  <div className="no-appointments-small">Libre</div>
                ) : (
                  dayAppointments.map(apt => (
                    <div 
                      key={apt.id} 
                      className={`appointment-small ${apt.statut || 'programme'}`}
                      style={{ backgroundColor: getStatusColor(apt.statut) }}
                      title={`${apt.patient.prenom} ${apt.patient.nom} - ${apt.typeConsultation || 'Consultation'}`}
                    >
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
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="doctor-calendar">
      <div className="calendar-header">
        <h2>Calendrier des Rendez-vous</h2>
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
            <button 
              className="nav-btn"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - (view === 'day' ? 1 : 7));
                setSelectedDate(newDate);
              }}
            >
              ‹ Précédent
            </button>
            <span className="current-period">
              {view === 'day' 
                ? selectedDate.toLocaleDateString('fr-FR')
                : `Semaine du ${getStartDate().toLocaleDateString('fr-FR')}`
              }
            </span>
            <button 
              className="nav-btn"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + (view === 'day' ? 1 : 7));
                setSelectedDate(newDate);
              }}
            >
              Suivant ›
            </button>
            <button 
              className="today-btn"
              onClick={() => setSelectedDate(new Date())}
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
            <button onClick={loadAppointments}>Réessayer</button>
          </div>
        )}
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement des rendez-vous...</p>
          </div>
        ) : (
          <>
            <div className="appointments-summary">
              <p>{appointments.length} rendez-vous trouvé(s)</p>
            </div>
            {view === 'day' ? renderDayView() : renderWeekView()}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorCalendar;