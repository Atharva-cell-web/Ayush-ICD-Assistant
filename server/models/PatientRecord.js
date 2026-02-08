const mongoose = require('mongoose');

const PatientRecordSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientName: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say'
    },
    symptoms: { type: String, required: true },
    ayushDiagnosis: String,
    ayushCode: String,
    icd11Diagnosis: String,
    icd11Code: String,
    confidence: String,
    reasoning: String,
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientRecord', PatientRecordSchema);
