require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const aiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ayush_icd_db';

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api', aiRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
