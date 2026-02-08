const express = require('express');
const PatientRecord = require('../models/PatientRecord');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { patientName, age, gender, symptoms, diagnosis } = req.body;

  if (!patientName || !age || !symptoms || !diagnosis) {
    return res.status(400).json({ error: 'Patient name, age, symptoms, and diagnosis are required.' });
  }

  const parsedAge = Number(age);
  if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
    return res.status(400).json({ error: 'Age must be a valid number.' });
  }

  try {
    const record = await PatientRecord.create({
      doctor: req.userId,
      patientName,
      age: parsedAge,
      gender,
      symptoms,
      ayushDiagnosis: diagnosis.ayushDiagnosis,
      ayushCode: diagnosis.ayushCode,
      icd11Diagnosis: diagnosis.icd11Diagnosis,
      icd11Code: diagnosis.icd11Code,
      confidence: diagnosis.confidence,
      reasoning: diagnosis.reasoning,
      description: diagnosis.description
    });

    return res.json({ record });
  } catch (err) {
    console.error('Create record error:', err);
    return res.status(500).json({ error: 'Failed to save patient record.' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const filter = { doctor: req.userId };
    const query = (req.query.q || '').trim();
    if (query) {
      filter.patientName = new RegExp(query, 'i');
    }

    const records = await PatientRecord.find(filter).sort({ createdAt: -1 });
    return res.json({ records });
  } catch (err) {
    console.error('List records error:', err);
    return res.status(500).json({ error: 'Failed to load records.' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ _id: req.params.id, doctor: req.userId });
    if (!record) {
      return res.status(404).json({ error: 'Record not found.' });
    }
    return res.json({ record });
  } catch (err) {
    console.error('Get record error:', err);
    return res.status(500).json({ error: 'Failed to load record.' });
  }
});

module.exports = router;
