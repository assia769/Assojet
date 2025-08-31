import React, { useState, useEffect } from 'react';
import DoctorService from '../../services/doctorService';
import * as XLSX from 'xlsx'; // Ajout de la vraie librairie Excel

// ✅ Vraie fonction de lecture Excel
const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('📊 Fichier Excel chargé:', file.name);
        
        // ✅ Utilisation de XLSX pour lire le fichier
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('📋 Données brutes Excel:', jsonData.slice(0, 5)); // Afficher les 5 premières lignes
        
        // ✅ Mapping correct des colonnes Excel
        const medicaments = jsonData.map((row, index) => {
          try {
            return {
              code: row.CODE || `MED${index}`,
              nom: row.NOM || row.nom || `Médicament ${index}`,
              dci: row.DCI1 || row.dci || '',
              dosage: row.DOSAGE1 || row.dosage || '',
              unite: row.UNITE_DOSAGE1 || row.unite || '',
              forme: row.FORME || row.forme || '',
              dose: `${row.DOSAGE1 || ''}${row.UNITE_DOSAGE1 || ''}`.trim() || 'Non spécifié'
            };
          } catch (err) {
            console.warn(`⚠️ Erreur ligne ${index}:`, err);
            return null;
          }
        }).filter(med => med && med.nom); // Filtrer les entrées nulles ou sans nom
        
        console.log(`✅ ${medicaments.length} médicaments traités sur ${jsonData.length} lignes`);
        resolve(medicaments);
      } catch (error) {
        console.error('❌ Erreur parsing Excel:', error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Base de données de médicaments par défaut
const DEFAULT_MEDICAMENTS = [
  { code: "M001", nom: "Paracétamol", dose: "500mg" },
  { code: "M002", nom: "Ibuprofène", dose: "400mg" },
  { code: "M003", nom: "Amoxicilline", dose: "500mg" },
  { code: "M004", nom: "Doliprane", dose: "1000mg" },
  { code: "M005", nom: "Aspégic", dose: "100mg" },
  { code: "M006", nom: "Augmentin", dose: "1g" },
  { code: "M007", nom: "Efferalgan", dose: "500mg" },
  { code: "M008", nom: "Nurofen", dose: "400mg" },
  { code: "M009", nom: "Clamoxyl", dose: "500mg" },
  { code: "M010", nom: "Advil", dose: "400mg" },
  { code: "M011", nom: "Smecta", dose: "3g" },
  { code: "M012", nom: "Gaviscon", dose: "500mg" },
  { code: "M013", nom: "Kardegic", dose: "75mg" },
  { code: "M014", nom: "Solupred", dose: "20mg" },
  { code: "M015", nom: "Levothyrox", dose: "75mcg" },
  { code: "M016", nom: "Inexium", dose: "40mg" },
  { code: "M017", nom: "Tahor", dose: "20mg" },
  { code: "M018", nom: "Crestor", dose: "10mg" },
  { code: "M019", nom: "Plavix", dose: "75mg" },
  { code: "M020", nom: "Coversyl", dose: "5mg" },
];

const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [medicamentSearch, setMedicamentSearch] = useState('');
  const [filteredMedicaments, setFilteredMedicaments] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(-1);
  const [medicamentsDB, setMedicamentsDB] = useState(DEFAULT_MEDICAMENTS);
  const [excelLoading, setExcelLoading] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medicaments: [{ nom: '', dosage: '', frequence: '', duree: '', instructions: '' }]
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      console.log('🔄 Chargement des patients...');
      const response = await DoctorService.getPatientsList();
      console.log('✅ Réponse patients:', response);
      
      // Gérer différents formats de réponse
      let patientsData = [];
      if (response.patients) {
        patientsData = response.patients;
      } else if (response.data && Array.isArray(response.data)) {
        patientsData = response.data;
      } else if (Array.isArray(response)) {
        patientsData = response;
      }
      
      setPatients(patientsData);
      console.log('📋 Patients chargés:', patientsData.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des patients:', error);
      setPatients([]); // Assurer que patients est toujours un tableau
    }
  };

  const loadPrescriptions = async (patientId) => {
    try {
      setLoading(true);
      const data = await DoctorService.getPrescriptions(patientId);
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des prescriptions:', error);
      setPrescriptions([]);
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

  // ✅ Charger fichier Excel avec gestion d'erreurs améliorée
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];
    
    const isValidFile = allowedTypes.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    );
    
    if (!isValidFile) {
      alert('⚠️ Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    setExcelLoading(true);
    
    try {
      console.log('📂 Traitement fichier:', file.name, 'Taille:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      const medicaments = await readExcelFile(file);
      
      if (medicaments.length === 0) {
        throw new Error('Aucun médicament trouvé dans le fichier');
      }
      
      setMedicamentsDB(medicaments);
      console.log(`✅ ${medicaments.length} médicaments chargés depuis Excel`);
      
      // Afficher un échantillon des données chargées
      console.log('📋 Échantillon des médicaments chargés:', medicaments.slice(0, 10));
      
      alert(`✅ ${medicaments.length} médicaments chargés avec succès !`);
    } catch (error) {
      console.error('❌ Erreur lecture Excel:', error);
      alert(`❌ Erreur lors de la lecture du fichier Excel: ${error.message}`);
    } finally {
      setExcelLoading(false);
      // Réinitialiser l'input file
      event.target.value = '';
    }
  };

  // Recherche de médicaments
  const handleMedicamentSearch = (searchTerm, index) => {
    updateMedicament(index, 'nom', searchTerm);
    
    if (searchTerm.length >= 2) {
      const filtered = medicamentsDB.filter(med =>
        med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.code && med.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (med.dci && med.dci.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 10);
      
      setFilteredMedicaments(filtered);
      setShowSuggestions(index);
    } else {
      setFilteredMedicaments([]);
      setShowSuggestions(-1);
    }
  };

  const selectMedicament = (medicament, index) => {
    updateMedicament(index, 'nom', medicament.nom);
    updateMedicament(index, 'dosage', medicament.dose);
    setFilteredMedicaments([]);
    setShowSuggestions(-1);
  };

 // ✅ CORRECTION PRINCIPALE : Fonction generatePDF corrigée
  const generatePDF = async (prescriptionId) => {
    try {
      console.log('📄 Génération PDF pour prescription ID:', prescriptionId);
      
      // ✅ Vérifier que l'ID est valide
      if (!prescriptionId || prescriptionId === 'undefined') {
        console.error('❌ ID de prescription invalide:', prescriptionId);
        alert('Erreur: ID de prescription invalide');
        return;
      }
      
      // ✅ S'assurer que l'ID est numérique
      const numericId = parseInt(prescriptionId);
      if (isNaN(numericId)) {
        console.error('❌ ID de prescription non numérique:', prescriptionId);
        alert('Erreur: ID de prescription doit être numérique');
        return;
      }
      
      const blob = await DoctorService.generatePrescriptionPDF(numericId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription_${numericId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitPrescription = async () => {
    if (!newPrescription.patientId) {
      alert('Veuillez sélectionner un patient');
      return;
    }

    if (newPrescription.medicaments.some(med => !med.nom || !med.dosage)) {
      alert('Veuillez remplir tous les champs obligatoires des médicaments');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Création prescription:', newPrescription);
      
      // Utiliser le service pour créer la prescription
      const result = await DoctorService.createPrescription({
        patientId: newPrescription.patientId,
        medicaments: newPrescription.medicaments,
        diagnostic: 'Prescription médicale',
        compteRendu: 'Consultation de prescription'
      });
      
      console.log('✅ Prescription créée:', result);
      
      // Réinitialiser le formulaire
      setNewPrescription({
        patientId: '',
        medicaments: [{ nom: '', dosage: '', frequence: '', duree: '', instructions: '' }]
      });
      setShowCreateForm(false);
      
      // Recharger les prescriptions si un patient est sélectionné
      if (selectedPatient) {
        loadPrescriptions(selectedPatient);
      }
      
      alert('Prescription créée avec succès !');
    } catch (error) {
      console.error('❌ Erreur création prescription:', error);
      alert('Erreur lors de la création de la prescription: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '15px'
      }}>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>
          📋 Gestion des Prescriptions
        </h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          ➕ Nouvelle Prescription
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        {/* ✅ Lecteur Excel amélioré */}
        <div style={{
          padding: '20px',
          border: '2px dashed #3498db',
          borderRadius: '12px',
          backgroundColor: '#f8f9fa',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>
            📊 Charger la base de médicaments Excel (CNOPS)
          </h4>
          
          <div style={{ marginBottom: '15px' }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              style={{
                padding: '10px',
                border: '1px solid #bdc3c7',
                borderRadius: '6px',
                backgroundColor: 'white',
                marginRight: '10px'
              }}
            />
            
            {excelLoading && (
              <span style={{ color: '#3498db', marginLeft: '10px' }}>
                ⏳ Traitement en cours...
              </span>
            )}
          </div>
          
          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
            📋 Format attendu: CODE | NOM | DCI1 | DOSAGE1 | UNITE_DOSAGE1 | FORME<br/>
            📊 {medicamentsDB.length} médicaments disponibles
          </div>
        </div>

        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: 'bold',
          color: '#34495e'
        }}>
          👤 Sélectionner un patient:
        </label>
        <select 
          value={selectedPatient} 
          onChange={(e) => handlePatientChange(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px',
            border: '2px solid #bdc3c7',
            borderRadius: '8px',
            fontSize: '16px',
            backgroundColor: 'white'
          }}
        >
          <option value="">-- Choisir un patient --</option>
          {Array.isArray(patients) && patients.map(patient => (
            <option key={patient.id_u || patient.id} value={patient.id_p || patient.id}>
              {patient.prenom} {patient.nom}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#7f8c8d',
          fontSize: '18px'
        }}>
          ⏳ Chargement des prescriptions...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {prescriptions.length > 0 ? prescriptions.map(prescription => (
            <div key={prescription.id} style={{
              border: '2px solid #ecf0f1',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                borderBottom: '1px solid #ecf0f1',
                paddingBottom: '10px'
              }}>
                <h4 style={{ color: '#2c3e50', margin: 0 }}>
                  📅 Prescription du {new Date(prescription.dateCreation).toLocaleDateString()}
                  <small style={{ display: 'block', color: '#7f8c8d', fontSize: '12px' }}>
                    ID: {prescription.id}
                  </small>
                </h4>
                <button 
                  onClick={() => generatePDF(prescription.id)}
                  style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📄 Générer PDF
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {prescription.medicaments?.map(med => (
                  <div key={med.id} style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3498db'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                      💊 {med.nom} - {med.dosage}
                    </div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                      🕐 Fréquence: {med.frequence}
                    </div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                      📅 Durée: {med.duree}
                    </div>
                    {med.instructions && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#7f8c8d', 
                        fontStyle: 'italic',
                        marginTop: '5px'
                      }}>
                        📝 Instructions: {med.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )) : selectedPatient ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#7f8c8d',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              📭 Aucune prescription trouvée pour ce patient
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#7f8c8d',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              👆 Sélectionnez un patient pour voir ses prescriptions
            </div>
          )}
        </div>
      )}

      {/* Formulaire de création - reste identique */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90%',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              borderBottom: '2px solid #ecf0f1',
              paddingBottom: '15px'
            }}>
              <h3 style={{ color: '#2c3e50', margin: 0 }}>
                📝 Nouvelle Prescription
              </h3>
              <button 
                onClick={() => setShowCreateForm(false)}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#34495e'
              }}>
                👤 Patient: *
              </label>
              <select 
                value={newPrescription.patientId}
                onChange={(e) => setNewPrescription({...newPrescription, patientId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="">-- Sélectionner un patient --</option>
                {Array.isArray(patients) && patients.map(patient => (
                  <option key={patient.id_u || patient.id} value={patient.id_p || patient.id}>
                    {patient.prenom} {patient.nom}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                💊 Médicaments
              </h4>
              
              {newPrescription.medicaments.map((medicament, index) => (
                <div key={index} style={{
                  border: '2px solid #ecf0f1',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '15px',
                  backgroundColor: '#f8f9fa',
                  position: 'relative'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="🔍 Rechercher un médicament..."
                        value={medicament.nom}
                        onChange={(e) => handleMedicamentSearch(e.target.value, index)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #bdc3c7',
                          borderRadius: '8px',
                          fontSize: '16px',
                          backgroundColor: 'white'
                        }}
                      />
                      
                      {/* Dropdown des suggestions */}
                      {showSuggestions === index && filteredMedicaments.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '2px solid #bdc3c7',
                          borderTop: 'none',
                          borderRadius: '0 0 8px 8px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 1001,
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}>
                          {filteredMedicaments.map((med, medIndex) => (
                            <div
                              key={medIndex}
                              onClick={() => selectMedicament(med, index)}
                              style={{
                                padding: '12px',
                                cursor: 'pointer',
                                borderBottom: medIndex < filteredMedicaments.length - 1 ? '1px solid #ecf0f1' : 'none',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f2f6'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                💊 {med.nom}
                              </div>
                              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                                📋 Code: {med.code} | 💉 Dose: {med.dose}
                                {med.dci && ` | 🧪 DCI: ${med.dci}`}
                                {med.forme && ` | 📦 Forme: ${med.forme}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="💉 Dosage"
                      value={medicament.dosage}
                      onChange={(e) => updateMedicament(index, 'dosage', e.target.value)}
                      style={{
                        padding: '12px',
                        border: '2px solid #bdc3c7',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <input
                      type="text"
                      placeholder="🕐 Fréquence (ex: 3 fois/jour)"
                      value={medicament.frequence}
                      onChange={(e) => updateMedicament(index, 'frequence', e.target.value)}
                      style={{
                        padding: '12px',
                        border: '2px solid #bdc3c7',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="📅 Durée (ex: 7 jours)"
                      value={medicament.duree}
                      onChange={(e) => updateMedicament(index, 'duree', e.target.value)}
                      style={{
                        padding: '12px',
                        border: '2px solid #bdc3c7',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                  
                  <textarea
                    placeholder="📝 Instructions particulières (optionnel)"
                    value={medicament.instructions}
                    onChange={(e) => updateMedicament(index, 'instructions', e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #bdc3c7',
                      borderRadius: '8px',
                      fontSize: '16px',
                      resize: 'vertical',
                      marginBottom: '15px',
                      backgroundColor: 'white'
                    }}
                  />
                  
                  {newPrescription.medicaments.length > 1 && (
                    <button 
                      onClick={() => removeMedicament(index)}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🗑️ Supprimer ce médicament
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={addMedicament}
                style={{
                  backgroundColor: '#27ae60',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  width: '100%',
                  marginBottom: '20px'
                }}
              >
                ➕ Ajouter un médicament
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'flex-end',
              borderTop: '2px solid #ecf0f1',
              paddingTop: '20px'
            }}>
              <button 
                onClick={() => setShowCreateForm(false)}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ❌ Annuler
              </button>
              <button 
                onClick={handleSubmitPrescription}
                style={{
                  backgroundColor: '#27ae60',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ✅ Créer la prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionManagement;