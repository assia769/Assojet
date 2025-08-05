// MedicalRecords.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DoctorService from '../../services/doctorService';

const MedicalRecords = () => {
  const { patientId } = useParams();
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [recordData, consultationsData, prescriptionsData] = await Promise.all([
        DoctorService.getMedicalRecord(patientId),
        DoctorService.getConsultationsByPatient(patientId),
        DoctorService.getPrescriptions(patientId)
      ]);
      
      setMedicalRecord(recordData);
      setConsultations(consultationsData);
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !patientId) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', e.target.description.value);

      await DoctorService.uploadMedicalFile(patientId, formData);
      setSelectedFile(null);
      e.target.reset();
      loadPatientData();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        await DoctorService.deleteMedicalFile(fileId);
        loadPatientData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="medical-records">
      <div className="page-header">
        <h2>Dossiers Médicaux</h2>
        {medicalRecord && (
          <div className="patient-info">
            <h3>{medicalRecord.patient?.prenom} {medicalRecord.patient?.nom}</h3>
          </div>
        )}
      </div>

      {!patientId ? (
        <div className="no-patient">
          <p>Sélectionnez un patient pour voir son dossier médical</p>
        </div>
      ) : (
        <div className="medical-records-content">
          <div className="tabs">
            <div className="tab-content">
              <div className="medical-history">
                <h4>Antécédents Médicaux</h4>
                <div className="history-item">
                  <strong>Allergies:</strong> {medicalRecord?.allergies || 'Aucune'}
                </div>
                <div className="history-item">
                  <strong>Antécédents familiaux:</strong> {medicalRecord?.antecedentsFamiliaux || 'Aucun'}
                </div>
                <div className="history-item">
                  <strong>Antécédents personnels:</strong> {medicalRecord?.antecedentsPersonnels || 'Aucun'}
                </div>
              </div>

              <div className="consultations-history">
                <h4>Historique des Consultations</h4>
                <div className="consultations-list">
                  {consultations.map(consultation => (
                    <div key={consultation.id} className="consultation-item">
                      <div className="consultation-date">
                        {new Date(consultation.dateConsultation).toLocaleDateString()}
                      </div>
                      <div className="consultation-info">
                        <strong>Motif:</strong> {consultation.motif}
                        <br />
                        <strong>Diagnostic:</strong> {consultation.diagnostic}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="prescriptions-history">
                <h4>Prescriptions</h4>
                <div className="prescriptions-list">
                  {prescriptions.map(prescription => (
                    <div key={prescription.id} className="prescription-item">
                      <div className="prescription-date">
                        {new Date(prescription.dateCreation).toLocaleDateString()}
                      </div>
                      <div className="prescription-content">
                        {prescription.medicaments?.map(med => (
                          <div key={med.id}>
                            {med.nom} - {med.dosage} - {med.duree}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="medical-files">
                <h4>Fichiers Médicaux</h4>
                <form onSubmit={handleFileUpload} className="file-upload-form">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <input
                    type="text"
                    name="description"
                    placeholder="Description du fichier"
                    required
                  />
                  <button type="submit" disabled={!selectedFile}>
                    Télécharger
                  </button>
                </form>

                <div className="files-list">
                  {medicalRecord?.fichiers?.map(file => (
                    <div key={file.id} className="file-item">
                      <span>{file.nom}</span>
                      <span>{file.description}</span>
                      <button onClick={() => handleDeleteFile(file.id)}>
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MedicalRecords;