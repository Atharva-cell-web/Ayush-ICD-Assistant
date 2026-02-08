import jsPDF from 'jspdf';

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString();
  }
  return date.toLocaleDateString();
}

export function generatePrescriptionPdf({ doctor, patient, diagnosis }) {
  const doc = new jsPDF();
  const headerTitle = doctor?.hospitalName || 'Medical Prescription';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(headerTitle, 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Doctor: ${doctor?.name || 'N/A'}`, 14, 26);
  if (doctor?.specialization) {
    doc.text(`Specialization: ${doctor.specialization}`, 14, 32);
  }
  doc.text(`Date: ${formatDate(patient?.visitDate)}`, 150, 26);

  doc.setFont('helvetica', 'bold');
  doc.text('Patient Info', 14, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${patient?.name || 'N/A'}`, 14, 52);
  doc.text(`Age: ${patient?.age || 'N/A'}`, 100, 52);
  if (patient?.gender) {
    doc.text(`Gender: ${patient.gender}`, 14, 60);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Ayurveda Diagnosis', 14, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${diagnosis?.ayushDiagnosis || 'N/A'}`, 14, 82);
  doc.text(`NAMASTE Code: ${diagnosis?.ayushCode || 'N/A'}`, 14, 90);

  doc.setFont('helvetica', 'bold');
  doc.text('ICD-11 Diagnosis', 110, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${diagnosis?.icd11Diagnosis || 'N/A'}`, 110, 82);
  doc.text(`ICD-11 Code: ${diagnosis?.icd11Code || 'N/A'}`, 110, 90);

  const summary = diagnosis?.description || diagnosis?.reasoning || '';
  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Summary', 14, 108);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(summary || 'N/A', 180);
  doc.text(summaryLines, 14, 116);

  doc.line(14, 270, 100, 270);
  doc.text('Signature', 14, 276);

  const fileName = `Prescription_${patient?.name || 'Patient'}.pdf`;
  doc.save(fileName);
}
