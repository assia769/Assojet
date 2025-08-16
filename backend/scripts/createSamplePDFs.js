// backend/scripts/createSamplePDFs.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Créer le dossier uploads/documents s'il n'existe pas
const uploadsDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Dossier créé:', uploadsDir);
}

// Fonction pour créer un PDF
function createPDF(filename, content) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = path.join(uploadsDir, filename);
    
    // Pipe vers un fichier
    doc.pipe(fs.createWriteStream(filePath));
    
    // En-tête
    doc.fontSize(20).fillColor('#2563eb').text(content.title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text('Cabinet Médical', { align: 'center' });
    doc.text('123 Rue de la Santé, 75000 Paris', { align: 'center' });
    doc.text('Tél: 01 23 45 67 89', { align: 'center' });
    
    // Ligne de séparation
    doc.strokeColor('#e5e7eb').lineWidth(1)
       .moveTo(50, doc.y + 20).lineTo(550, doc.y + 20).stroke();
    
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#000');
    
    // Contenu
    content.sections.forEach(section => {
      if (section.title) {
        doc.fontSize(14).text(section.title, { underline: true });
        doc.moveDown(0.3);
      }
      if (section.content) {
        doc.fontSize(12).text(section.content, { width: 500 });
        doc.moveDown(0.5);
      }
    });
    
    // Signature
    doc.fontSize(10).fillColor('#666');
    doc.text('Dr. Sophie Bernard', 400, doc.y + 30);
    doc.text('Médecin généraliste', 400, doc.y + 5);
    
    doc.end();
    
    doc.on('end', () => {
      console.log(`✅ PDF créé: ${filename}`);
      resolve(filePath);
    });
    
    doc.on('error', reject);
  });
}

// Contenu des PDFs
const documents = [
  {
    filename: 'prescription_doliprane_2024.pdf',
    content: {
      title: 'PRESCRIPTION MÉDICALE',
      sections: [
        { title: 'Patient: Martin Dupont', content: 'Date: ' + new Date().toLocaleDateString('fr-FR') },
        { title: 'PRESCRIPTION:', content: '1. DOLIPRANE 1000mg\n   - 1 comprimé 3 fois par jour\n   - Pendant 5 jours\n\n2. SPASFON 80mg\n   - 1 comprimé en cas de douleur\n   - Maximum 3 par jour' }
      ]
    }
  },
  {
    filename: 'prescription_antibiotique_2024.pdf',
    content: {
      title: 'PRESCRIPTION MÉDICALE',
      sections: [
        { title: 'Patient: Marie Durand', content: 'Date: ' + new Date(Date.now() - 5*24*60*60*1000).toLocaleDateString('fr-FR') },
        { title: 'PRESCRIPTION:', content: '1. AMOXICILLINE 1g\n   - 1 comprimé 2 fois par jour\n   - Pendant 7 jours\n\n2. ULTRA-LEVURE 250mg\n   - 1 gélule 2 fois par jour' }
      ]
    }
  },
  {
    filename: 'ordonnance_complete_2024.pdf',
    content: {
      title: 'ORDONNANCE MÉDICALE',
      sections: [
        { title: 'Patient: Pierre Martin', content: 'Médecin: Dr. Sophie Bernard\nDate: ' + new Date().toLocaleDateString('fr-FR') },
        { title: 'DIAGNOSTIC: Hypertension artérielle', content: '' },
        { title: 'TRAITEMENT:', content: '1. AMLOR 5mg\n   - 1 comprimé le matin\n   - Pendant 3 mois\n\n2. KARDEGIC 75mg\n   - 1 comprimé le soir' }
      ]
    }
  },
  {
    filename: 'analyse_sang_2024.pdf',
    content: {
      title: 'ANALYSE SANGUINE',
      sections: [
        { title: 'Patient: Martin Dupont', content: 'Date de prélèvement: ' + new Date().toLocaleDateString('fr-FR') },
        { title: 'RÉSULTATS:', content: 'Hémoglobine: 14,2 g/dL (Normal)\nGlycémie: 0,95 g/L (Normal)\nCholestérol: 2,20 g/L (Élevé)\nTriglycérides: 1,10 g/L (Normal)' },
        { title: 'CONCLUSION:', content: 'Hypercholestérolémie modérée. Régime conseillé.' }
      ]
    }
  },
  {
    filename: 'cr_consultation_2024.pdf',
    content: {
      title: 'COMPTE RENDU CONSULTATION',
      sections: [
        { title: 'Patient: Marie Durand', content: 'Service: Cardiologie\nDate: ' + new Date().toLocaleDateString('fr-FR') },
        { title: 'EXAMEN:', content: 'TA: 130/80 mmHg\nPouls: 72 bpm\nAuscultation normale' },
        { title: 'CONCLUSION:', content: 'État cardiovasculaire satisfaisant. Contrôle dans 6 mois.' }
      ]
    }
  }
];

// Créer tous les PDFs
async function createAllPDFs() {
  console.log('🚀 Début de création des fichiers PDF...');
  
  for (const doc of documents) {
    try {
      await createPDF(doc.filename, doc.content);
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${doc.filename}:`, error);
    }
  }
  
  console.log('\n✅ Tous les fichiers PDF ont été créés dans:', uploadsDir);
  console.log('📁 Fichiers créés:');
  
  // Lister les fichiers créés
  try {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => console.log(`   - ${file}`));
  } catch (error) {
    console.error('Erreur lors de la lecture du dossier:', error);
  }
}

// Exécuter le script
if (require.main === module) {
  createAllPDFs().catch(console.error);
}

module.exports = { createPDF, createAllPDFs };