// PrescriptionManagement.js
import React, { useState, useEffect } from 'react';
import DoctorService from '../../services/doctorService';

const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medicaments: [{ nom: '', dosage: '', frequence: '', duree: '', instructions: '' }]
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await DoctorService.getPatientsList();
      setPatients(data);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    }
  };

  const loadPrescriptions = async (patientId) => {
    try {
      setLoading(true);
      const data = await DoctorService.getPrescriptions(patientId);
      setPrescriptions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (patientId) => {
    setSelectedPatient(patientId);
    if (patientId) {
      loadPrescriptions(patientId);
    } else {
      setPrescriptions([]);
    }
  };

  const addMedicament = () => {
    setNewPrescription({
      ...newPrescription,
      medicaments: [...newPrescription.medicaments, 
        { nom: '', dosage: '', frequence: '', duree: '', instructions: '' }
      ]
    });
  };

  const removeMedicament = (index) => {
    setNewPrescription({
      ...newPrescription,
      medicaments: newPrescription.medicaments.filter((_, i) => i !== index)
    });
  };

  const updateMedicament = (index, field, value) => {
    const updatedMedicaments = [...newPrescription.medicaments];
    updatedMedicaments[index][field] = value;
    setNewPrescription({
      ...newPrescription,
      medicaments: updatedMedicaments
    });
  };

  const generatePDF = async (prescriptionId) => {
    try {
      const blob = await DoctorService.generatePrescriptionPDF(prescriptionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription_${prescriptionId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    }
  };

  return (
    <div className="prescription-management">
      <div className="page-header">
        <h2>Gestion des Prescriptions</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Nouvelle Prescription
        </button>
      </div>

      <div className="patient-selector">
        <label>Sélectionner un patient:</label>
        <select 
          value={selectedPatient} 
          onChange={(e) => handlePatientChange(e.target.value)}
        >
          <option value="">-- Choisir un patient --</option>
          {patients.map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.prenom} {patient.nom}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="prescriptions-list">
          {prescriptions.map(prescription => (
            <div key={prescription.id} className="prescription-card">
              <div className="prescription-header">
                <h4>Prescription du {new Date(prescription.dateCreation).toLocaleDateString()}</h4>
                <div className="prescription-actions">
                  <button onClick={() => generatePDF(prescription.id)}>
                    Télécharger PDF
                  </button>
                </div>
              </div>
              <div className="medicaments-list">
                {prescription.medicaments?.map(med => (
                  <div key={med.id} className="medicament-item">
                    <strong>{med.nom}</strong> - {med.dosage}
                    <br />
                    <span>Fréquence: {med.frequence}</span>
                    <br />
                    <span>Durée: {med.duree}</span>
                    {med.instructions && (
                      <>
                        <br />
                        <span>Instructions: {med.instructions}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Nouvelle Prescription</h3>
              <button onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            
            <form className="prescription-form">
              <div className="form-group">
                <label>Patient:</label>
                <select 
                  value={newPrescription.patientId}
                  onChange={(e) => setNewPrescription({...newPrescription, patientId: e.target.value})}
                  required
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.prenom} {patient.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="medicaments-section">
                <h4>Médicaments</h4>
                {newPrescription.medicaments.map((medicament, index) => (
                  <div key={index} className="medicament-form">
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Nom du médicament"
                        value={medicament.nom}
                        onChange={(e) => updateMedicament(index, 'nom', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={medicament.dosage}
                        onChange={(e) => updateMedicament(index, 'dosage', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Fréquence"
                        value={medicament.frequence}
                        onChange={(e) => updateMedicament(index, 'frequence', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Durée"
                        value={medicament.duree}
                        onChange={(e) => updateMedicament(index, 'duree', e.target.value)}
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Instructions particulières"
                      value={medicament.instructions}
                      onChange={(e) => updateMedicament(index, 'instructions', e.target.value)}
                      rows="2"
                    />
                    {newPrescription.medicaments.length > 1 && (
                      <button type="button" onClick={() => removeMedicament(index)}>
                        Supprimer ce médicament
                      </button>
                    )}
                  </div>
                ))}
                
                <button type="button" onClick={addMedicament}>
                  Ajouter un médicament
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </button>
                <button type="submit">
                  Créer la prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PrescriptionManagement;