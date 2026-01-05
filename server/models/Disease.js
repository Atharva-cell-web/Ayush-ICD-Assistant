const mongoose = require('mongoose');

const DiseaseSchema = new mongoose.Schema({
  diseaseName: { type: String, required: true },
  ayushCode: { type: String, required: true },  // e.g., NAMASTE Code
  icdCode: { type: String, required: true },    // e.g., ICD-11 Code
  description: String,
  confidenceScore: Number,                      // e.g., 95.8
  category: String                              // e.g., 'Ayurveda'
});

module.exports = mongoose.model('Disease', DiseaseSchema);