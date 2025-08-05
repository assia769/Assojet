// ConsultationForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorService from '../../services/doctorService';

const ConsultationForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState({
    motif: '',
    symptomes: '',
    diagnostic: '',
    traitement: '',
    notes: '',
    examenPhysique: '',
    temperature: '',
    tension: '',
    pouls: '',
    poids: '',
    taille: ''
  });
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    if (appointmentId) {
      loadConsultation();
    }
  }, [appointmentId]);

  const loadConsultation = async () => {
    try {
      setLoading(true);
      const data = await DoctorService.getConsultation(appointmentId);
      setConsultation(data.consultation || {});
      setPatient(data.patient);
    } catch (error) {
      console.error('Erreur lors du chargement de la consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (consultation.id) {
        await DoctorService.updateConsultation(consultation.id, consultation);
      } else {
        await DoctorService.createConsultation({
          ...consultation,
          appointmentId
        });
      }
      navigate('/doctor');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultation-form">
      <div className="page-header">
        <h2>Consultation Médicale</h2>
        {patient && (
          <div className="patient-info">
            <h3>{patient.prenom} {patient.nom}</h3>
            <p>Âge: {patient.age} ans - Tel: {patient.telephone}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="consultation-form-content">
        <div className="form-section">
          <h4>Informations Générales</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Motif de consultation</label>
              <textarea
                value={consultation.motif}
                onChange={(e) => setConsultation({...consultation, motif: e.target.value})}
                rows="3"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Symptômes</label>
              <textarea
                value={consultation.symptomes}
                onChange={(e) => setConsultation({...consultation, symptomes: e.target.value})}
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Examen Physique</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Température (°C)</label>
              <input
                type="number"
                step="0.1"
                value={consultation.temperature}
                onChange={(e) => setConsultation({...consultation, temperature: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Tension artérielle</label>
              <input
                type="text"
                value={consultation.tension}
                onChange={(e) => setConsultation({...consultation, tension: e.target.value})}
                placeholder="120/80"
              />
            </div>
            <div className="form-group">
              <label>Pouls (bpm)</label>
              <input
                type="number"
                value={consultation.pouls}
                onChange={(e) => setConsultation({...consultation, pouls: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Poids (kg)</label>
              <input
                type="number"
                step="0.1"
                value={consultation.poids}
                onChange={(e) => setConsultation({...consultation, poids: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Taille (cm)</label>
              <input
                type="number"
                value={consultation.taille}
                onChange={(e) => setConsultation({...consultation, taille: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Notes d'examen</label>
              <textarea
                value={consultation.examenPhysique}
                onChange={(e) => setConsultation({...consultation, examenPhysique: e.target.value})}
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Diagnostic et Traitement</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Diagnostic</label>
              <textarea
                value={consultation.diagnostic}
                onChange={(e) => setConsultation({...consultation, diagnostic: e.target.value})}
                rows="3"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Traitement prescrit</label>
              <textarea
                value={consultation.traitement}
                onChange={(e) => setConsultation({...consultation, traitement: e.target.value})}
                rows="3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Notes complémentaires</label>
              <textarea
                value={consultation.notes}
                onChange={(e) => setConsultation({...consultation, notes: e.target.value})}
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/doctor')} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ConsultationForm;