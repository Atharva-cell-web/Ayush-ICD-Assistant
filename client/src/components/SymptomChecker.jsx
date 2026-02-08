import React, { useState } from 'react';
import api from '../api';
import { generatePrescriptionPdf } from '../utils/prescription';
import './SymptomChecker.css';

const SymptomChecker = ({ doctor, isAuthed }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Prefer not to say');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveError, setSaveError] = useState(null);
  const [savedRecord, setSavedRecord] = useState(null);

  const handleCheck = async () => {
    if (!input) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setSaveError(null);
    setSaveStatus('idle');
    setSavedRecord(null);

    try {
      const res = await api.post('/api/diagnose', { symptoms: input });
      setResult(res.data);
    } catch (err) {
      setError('Service unavailable. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openSaveModal = () => {
    if (!isAuthed) {
      setSaveError('Please login to save patient history.');
      return;
    }
    setShowSaveModal(true);
  };

  const closeSaveModal = () => {
    setShowSaveModal(false);
  };

  const handleSave = async event => {
    event.preventDefault();
    if (!patientName || !patientAge) {
      setSaveError('Patient name and age are required.');
      return;
    }

    setSaveStatus('saving');
    setSaveError(null);

    try {
      const res = await api.post('/api/patients', {
        patientName,
        age: patientAge,
        gender: patientGender,
        symptoms: input,
        diagnosis: result
      });
      setSavedRecord(res.data.record);
      setSaveStatus('saved');
      setShowSaveModal(false);
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to save record.';
      setSaveError(message);
      setSaveStatus('error');
    }
  };

  const handlePrint = () => {
    if (!savedRecord) return;
    generatePrescriptionPdf({
      doctor,
      patient: {
        name: savedRecord.patientName,
        age: savedRecord.age,
        gender: savedRecord.gender,
        visitDate: savedRecord.createdAt
      },
      diagnosis: {
        ayushDiagnosis: savedRecord.ayushDiagnosis,
        ayushCode: savedRecord.ayushCode,
        icd11Diagnosis: savedRecord.icd11Diagnosis,
        icd11Code: savedRecord.icd11Code,
        description: savedRecord.description,
        reasoning: savedRecord.reasoning
      }
    });
  };

  return (
    <div className="symptom-checker-container">
      <div className="checker-header">
        <h2>AI Vaidya</h2>
        <p>
          Search using <b>Symptoms</b>, <b>Medical Codes</b> (NAMC/ICD), or{' '}
          <b>Disease Names</b>.
        </p>
      </div>

      {!isAuthed && (
        <div className="login-hint">Login to save patient history and print prescriptions.</div>
      )}

      <textarea
        className="symptom-input"
        rows="3"
        placeholder="e.g. 'Severe joint pain', 'NAMC-23', 'Diabetes', or 'FA00'..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button className="analyze-btn" onClick={handleCheck} disabled={loading}>
        {loading ? 'Consulting AI Vaidya...' : 'Identify Condition'}
      </button>

      {error && <p className="error-text">{error}</p>}
      {saveError && <p className="error-text">{saveError}</p>}

      {result && (
        <div className="diagnosis-result">
          <div className="dual-code-display">
            <div className="code-card ayush">
              <h4>AYUSH / NAMASTE</h4>
              <div className="big-code">{result.ayushCode || 'N/A'}</div>
              <div className="name">{result.ayushDiagnosis}</div>
            </div>

            <div className="code-card icd">
              <h4>WHO ICD-11</h4>
              <div className="big-code">{result.icd11Code || 'N/A'}</div>
              <div className="name">{result.icd11Diagnosis}</div>
            </div>
          </div>

          <div className="ai-explanation">
            <h3>Clinical Reasoning</h3>
            <p>{result.reasoning}</p>

            <div className="trust-citation">
              <strong>Medical Summary:</strong> {result.description}
            </div>
          </div>

          <div className="result-actions">
            <button
              className="primary-btn"
              type="button"
              onClick={openSaveModal}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saved' ? 'Saved' : 'Save to History'}
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={handlePrint}
              disabled={!savedRecord}
            >
              Print Prescription
            </button>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Save Patient Record</h3>
            <form onSubmit={handleSave}>
              <label>
                Patient Name
                <input
                  type="text"
                  value={patientName}
                  onChange={event => setPatientName(event.target.value)}
                  required
                />
              </label>
              <label>
                Age
                <input
                  type="number"
                  min="1"
                  value={patientAge}
                  onChange={event => setPatientAge(event.target.value)}
                  required
                />
              </label>
              <label>
                Gender
                <select
                  value={patientGender}
                  onChange={event => setPatientGender(event.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={closeSaveModal}>
                  Cancel
                </button>
                <button className="primary-btn" type="submit" disabled={saveStatus === 'saving'}>
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
