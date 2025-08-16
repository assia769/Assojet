// backend/utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class MedicalPDFGenerator {
  static generatePrescription(data) {
    const doc = new PDFDocument({ margin: 50 });
    
    // En-tête
    doc.fontSize(24).fillColor('#2563eb').text('PRESCRIPTION MÉDICALE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text('Cabinet Médical', { align: 'center' });
    doc.text('123 Rue de la Santé, 75000 Paris', { align: 'center' });
    doc.text('Tél: 01 23 45 67 89', { align: 'center' });
    
    // Ligne de séparation
    doc.strokeColor('#e5e7eb').lineWidth(1)
       .moveTo(50, doc.y + 20).lineTo(550, doc.y + 20).stroke();
    
    doc.moveDown(1);
    
    // Informations médecin
    doc.fontSize(14).fillColor('#000').text('Dr. ' + data.doctor_nom + ' ' + data.doctor_prenom);
    doc.fontSize(10).fillColor('#666').text(data.specialite || 'Médecine Générale');
    doc.moveDown(0.5);
    
    // Informations patient
    doc.fontSize(12).fillColor('#000');
    doc.text('Patient: ' + data.patient_nom + ' ' + data.patient_prenom);
    doc.text('Date de naissance: ' + new Date(data.patient_ddn).toLocaleDateString('fr-FR'));
    doc.text('Date de consultation: ' + new Date(data.date_consultation).toLocaleDateString('fr-FR'));
    
    doc.moveDown(1);
    
    // Corps de la prescription
    doc.fontSize(16).text('PRESCRIPTION:', { underline: true });
    doc.moveDown(0.5);
    
    if (data.medicaments && data.medicaments.length > 0) {
      data.medicaments.forEach((med, index) => {
        doc.fontSize(12);
        doc.text(`${index + 1}. ${med.nom}`);
        doc.fontSize(10).fillColor('#666');
        doc.text(`   Posologie: ${med.posologie}`);
        doc.text(`   Durée: ${med.duree}`);
        doc.fillColor('#000').moveDown(0.3);
      });
    } else {
      doc.fontSize(12).text(data.contenu || 'Prescription détaillée...');
    }
    
    doc.moveDown(1);
    
    // Instructions
    if (data.instructions) {
      doc.fontSize(12).text('Instructions spéciales:');
      doc.fontSize(10).text(data.instructions, { width: 400 });
      doc.moveDown(0.5);
    }
    
    // Signature
    doc.fontSize(10).fillColor('#666');
    doc.text('Signature du médecin', 400, doc.y + 30);
    doc.text('Dr. ' + data.doctor_nom + ' ' + data.doctor_prenom, 400, doc.y + 5);
    
    return doc;
  }

  static generateAnalysisReport(data) {
    const doc = new PDFDocument({ margin: 50 });
    
    // En-tête
    doc.fontSize(24).fillColor('#059669').text('RAPPORT D\'ANALYSE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text('Laboratoire Médical', { align: 'center' });
    doc.text('456 Avenue des Analyses, 75000 Paris', { align: 'center' });
    
    // Ligne de séparation
    doc.strokeColor('#e5e7eb').lineWidth(1)
       .moveTo(50, doc.y + 20).lineTo(550, doc.y + 20).stroke();
    
    doc.moveDown(1);
    
    // Informations patient
    doc.fontSize(14).fillColor('#000').text('Informations Patient');
    doc.fontSize(12);
    doc.text('Nom: ' + data.patient_nom + ' ' + data.patient_prenom);
    doc.text('Date de naissance: ' + new Date(data.patient_ddn).toLocaleDateString('fr-FR'));
    doc.text('Date de prélèvement: ' + new Date(data.date_prelevement).toLocaleDateString('fr-FR'));
    doc.text('Médecin prescripteur: Dr. ' + data.doctor_nom + ' ' + data.doctor_prenom);
    
    doc.moveDown(1);
    
    // Résultats
    doc.fontSize(16).text('RÉSULTATS D\'ANALYSES:', { underline: true });
    doc.moveDown(0.5);
    
    if (data.analyses && data.analyses.length > 0) {
      // Tableau des résultats
      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#000');
      
      // En-têtes
      doc.text('Examen', 50, tableTop);
      doc.text('Résultat', 200, tableTop);
      doc.text('Valeurs Normales', 300, tableTop);
      doc.text('Unité', 450, tableTop);
      
      // Ligne sous les en-têtes
      doc.strokeColor('#ccc').lineWidth(0.5)
         .moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
      
      let currentY = tableTop + 25;
      
      data.analyses.forEach((analyse) => {
        doc.text(analyse.nom, 50, currentY);
        doc.text(analyse.resultat, 200, currentY);
        doc.text(analyse.valeurs_normales, 300, currentY);
        doc.text(analyse.unite, 450, currentY);
        currentY += 20;
      });
    } else {
      doc.fontSize(12).text(data.contenu || 'Résultats d\'analyses détaillés...');
    }
    
    doc.moveDown(2);
    
    // Conclusion
    if (data.conclusion) {
      doc.fontSize(12).text('Conclusion:', { underline: true });
      doc.text(data.conclusion, { width: 400 });
    }
    
    // Signature
    doc.fontSize(10).fillColor('#666');
    doc.text('Laboratoire certifié', 400, doc.y + 30);
    doc.text('Dr. Biologiste', 400, doc.y + 5);
    
    return doc;
  }

  static generateMedicalReport(data) {
    const doc = new PDFDocument({ margin: 50 });
    
    // En-tête
    doc.fontSize(24).fillColor('#dc2626').text('COMPTE RENDU MÉDICAL', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text('Service de ' + (data.service || 'Médecine Générale'), { align: 'center' });
    doc.text('Hôpital Central', { align: 'center' });
    
    // Ligne de séparation
    doc.strokeColor('#e5e7eb').lineWidth(1)
       .moveTo(50, doc.y + 20).lineTo(550, doc.y + 20).stroke();
    
    doc.moveDown(1);
    
    // Informations
    doc.fontSize(14).fillColor('#000').text('Informations Générales');
    doc.fontSize(12);
    doc.text('Patient: ' + data.patient_nom + ' ' + data.patient_prenom);
    doc.text('Date: ' + new Date(data.date_consultation).toLocaleDateString('fr-FR'));
    doc.text('Médecin: Dr. ' + data.doctor_nom + ' ' + data.doctor_prenom);
    doc.text('Type de consultation: ' + (data.type_consultation || 'Consultation générale'));
    
    doc.moveDown(1);
    
    // Motif
    if (data.motif) {
      doc.fontSize(14).text('Motif de consultation:', { underline: true });
      doc.fontSize(12).text(data.motif);
      doc.moveDown(0.5);
    }
    
    // Examen clinique
    doc.fontSize(14).text('Examen clinique:', { underline: true });
    doc.fontSize(12).text(data.examen_clinique || 'Examen normal, patient en bon état général.');
    doc.moveDown(0.5);
    
    // Diagnostic
    if (data.diagnostic) {
      doc.fontSize(14).text('Diagnostic:', { underline: true });
      doc.fontSize(12).text(data.diagnostic);
      doc.moveDown(0.5);
    }
    
    // Traitement
    if (data.traitement) {
      doc.fontSize(14).text('Traitement prescrit:', { underline: true });
      doc.fontSize(12).text(data.traitement);
      doc.moveDown(0.5);
    }
    
    // Recommandations
    if (data.recommandations) {
      doc.fontSize(14).text('Recommandations:', { underline: true });
      doc.fontSize(12).text(data.recommandations);
    }
    
    // Signature
    doc.fontSize(10).fillColor('#666');
    doc.text('Signature du médecin', 400, doc.y + 40);
    doc.text('Dr. ' + data.doctor_nom + ' ' + data.doctor_prenom, 400, doc.y + 5);
    
    return doc;
  }
}

module.exports = MedicalPDFGenerator;