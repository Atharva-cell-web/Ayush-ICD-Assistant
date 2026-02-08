const express = require('express');
const router = express.Router();
// Import the AI functions from your service
const { searchWithAI, getDiagnosis } = require('../services/aiService');

// @route   GET /api/search?q=...
// @desc    Real-Time AI Search (Generates results if DB is empty)
router.get('/search', async (req, res) => {
  const query = req.query.q;
  
  // 1. Validation: Don't search for empty strings or very short inputs
  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    console.log(`🔍 AI Searching for: ${query}`);
    
    // 2. Call the AI Search function
    const results = await searchWithAI(query);
    
    // 3. Send results back to Frontend
    res.json(results);
    
  } catch (err) {
    console.error("Search Route Error:", err);
    // Return empty array instead of crashing if AI fails
    res.json([]); 
  }
});

// @route   POST /api/diagnose
// @desc    Detailed Symptom Checker (The "Diagnose Now" button)
router.post('/diagnose', async (req, res) => {
  const { symptoms } = req.body;
  
  if (!symptoms) {
    return res.status(400).json({ error: "No symptoms provided" });
  }

  try {
    const result = await getDiagnosis(symptoms);
    res.json(result);
  } catch (err) {
    console.error("Diagnosis Route Error:", err);
    res.status(500).json({ error: "Diagnosis failed" });
  }
});

// @route   POST /api/seed
// @desc    (Optional) Keep this if you still want to load dummy data later
router.get('/seed', async (req, res) => {
  res.json({ message: "Seeding is disabled in AI Mode." });
});

module.exports = router;