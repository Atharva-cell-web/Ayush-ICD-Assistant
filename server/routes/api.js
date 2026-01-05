const express = require('express');
const router = express.Router();
const Disease = require('../models/Disease');

// @route   GET /api/search?q=...
// @desc    Smart Search for Diseases
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    // Regex for partial matching (case-insensitive)
    const results = await Disease.find({
      diseaseName: { $regex: query, $options: 'i' }
    }).limit(5);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/seed
// @desc    Load dummy data (Run this once via Postman/Curl)
router.get('/seed', async (req, res) => {
  const dummyData = [
    { diseaseName: "Amavata", ayushCode: "AYU-001", icdCode: "FA00.0", description: "Rheumatoid Arthritis-like condition affecting joints.", confidenceScore: 95.8, category: "Ayurveda" },
    { diseaseName: "Jwara", ayushCode: "AYU-024", icdCode: "MG26", description: "Acute fever or Pyrexia of unknown origin.", confidenceScore: 98.2, category: "Ayurveda" },
    { diseaseName: "Kasa", ayushCode: "AYU-056", icdCode: "MD23", description: "Cough related to respiratory tract infection.", confidenceScore: 92.5, category: "Siddha" },
    { diseaseName: "Tamaka Shwasa", ayushCode: "AYU-102", icdCode: "CA23", description: "Bronchial Asthma.", confidenceScore: 96.0, category: "Ayurveda" },
    { diseaseName: "Madhumeha", ayushCode: "AYU-205", icdCode: "5A10", description: "Diabetes Mellitus Type 2.", confidenceScore: 99.1, category: "Ayurveda" }
  ];
  
  try {
    await Disease.deleteMany({}); // Clear old data
    await Disease.insertMany(dummyData);
    res.json({ message: "Database Seeded Successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;