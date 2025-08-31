// ConsultationForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorService from '../../services/doctorService';
import './ConsultationForm.css'; // Assurez-vous d'avoir ce fichier CSS

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
    taille: '',
    patientId: '' // Ajouté pour la sélection de patient
  });
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]); // Liste des patients
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    loadPatients();
    if (appointmentId) {
      loadConsultation();
    }
  }, [appointmentId]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await DoctorService.getPatientsList({ limit: 100 });
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

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

  const handlePatientChange = (e) => {
    const selectedPatientId = e.target.value;
    setConsultation(prev => ({ ...prev, patientId: selectedPatientId }));
    
    // Trouver le patient sélectionné dans la liste
    const selectedPatient = patients.find(p => p.id_p === parseInt(selectedPatientId));
    setPatient(selectedPatient);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation améliorée
    if (!consultation.patientId && !appointmentId) {
      alert('Veuillez sélectionner un patient');
      return;
    }
    
    if (!consultation.diagnostic.trim()) {
      alert('Le diagnostic est obligatoire');
      return;
    }

    if (!consultation.motif.trim()) {
      alert('Le motif de consultation est obligatoire');
      return;
    }

    try {
      setLoading(true);
      
      // Préparer les données avec tous les champs
      const consultationData = {
        diagnostic: consultation.diagnostic.trim(),
        motif: consultation.motif.trim(),
        symptomes: consultation.symptomes.trim(),
        traitement: consultation.traitement.trim(),
        notes: consultation.notes.trim(),
        examenPhysique: consultation.examenPhysique.trim(),
        temperature: consultation.temperature ? parseFloat(consultation.temperature) : null,
        tension: consultation.tension.trim(),
        pouls: consultation.pouls ? parseInt(consultation.pouls) : null,
        poids: consultation.poids ? parseFloat(consultation.poids) : null,
        taille: consultation.taille ? parseInt(consultation.taille) : null,
        // Ajouter l'ID approprié
        ...(appointmentId ? { appointmentId } : { patientId: consultation.patientId })
      };

      console.log('Données à envoyer:', consultationData);
      
      if (consultation.id) {
        await DoctorService.updateConsultation(consultation.id, consultationData);
        alert('Consultation mise à jour avec succès !');
      } else {
        await DoctorService.createConsultation(consultationData);
        alert('Consultation créée avec succès !');
      }
      
      navigate('/doctor');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // Gestion d'erreurs plus détaillée
      let errorMessage = 'Erreur lors de la sauvegarde de la consultation';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
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
        {/* Sélection de patient si pas d'appointmentId */}
        {!appointmentId && (
          <div className="form-section">
            <h4>Sélection du Patient</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Choisir un patient *</label>
                <select
                  value={consultation.patientId}
                  onChange={handlePatientChange}
                  required
                  className="patient-select"
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map(patient => (
                    <option key={patient.id_p} value={patient.id_p}>
                      {patient.prenom} {patient.nom} - {patient.email}
                    </option>
                  ))}
                </select>
                {loadingPatients && <small>Chargement des patients...</small>}
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <h4>Informations Générales</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Motif de consultation *</label>
              <textarea
                value={consultation.motif}
                onChange={(e) => setConsultation({...consultation, motif: e.target.value})}
                rows="3"
                required
                className="form-input"
                placeholder="Décrivez le motif de la consultation..."
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
                className="form-input"
                placeholder="Décrivez les symptômes observés..."
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
                className="form-input"
                placeholder="37.0"
              />
            </div>
            <div className="form-group">
              <label>Tension artérielle</label>
              <input
                type="text"
                value={consultation.tension}
                onChange={(e) => setConsultation({...consultation, tension: e.target.value})}
                placeholder="120/80"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Pouls (bpm)</label>
              <input
                type="number"
                value={consultation.pouls}
                onChange={(e) => setConsultation({...consultation, pouls: e.target.value})}
                className="form-input"
                placeholder="70"
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
                className="form-input"
                placeholder="70.0"
              />
            </div>
            <div className="form-group">
              <label>Taille (cm)</label>
              <input
                type="number"
                value={consultation.taille}
                onChange={(e) => setConsultation({...consultation, taille: e.target.value})}
                className="form-input"
                placeholder="170"
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
                className="form-input"
                placeholder="Notes sur l'examen physique..."
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Diagnostic et Traitement</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Diagnostic *</label>
              <textarea
                value={consultation.diagnostic}
                onChange={(e) => setConsultation({...consultation, diagnostic: e.target.value})}
                rows="3"
                required
                className="form-input"
                placeholder="Diagnostic médical..."
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
                className="form-input"
                placeholder="Traitement et prescriptions..."
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
                className="form-input"
                placeholder="Notes additionnelles..."
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