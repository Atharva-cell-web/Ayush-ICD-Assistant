import React, { useEffect, useState } from 'react';
import api from '../api';
import { generatePrescriptionPdf } from '../utils/prescription';
import './PatientHistory.css';

const PatientHistory = ({ doctor }) => {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = async query => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/patients', {
        params: query ? { q: query } : {}
      });
      setRecords(res.data.records || []);
      if (query && selected) {
        const updated = (res.data.records || []).find(item => item._id === selected._id);
        setSelected(updated || null);
      }
    } catch (err) {
      setError('Failed to load patient history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString();
  };

  const handlePrint = record => {
    generatePrescriptionPdf({
      doctor,
      patient: {
        name: record.patientName,
        age: record.age,
        gender: record.gender,
        visitDate: record.createdAt
      },
      diagnosis: {
        ayushDiagnosis: record.ayushDiagnosis,
        ayushCode: record.ayushCode,
        icd11Diagnosis: record.icd11Diagnosis,
        icd11Code: record.icd11Code,
        description: record.description,
        reasoning: record.reasoning
      }
    });
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h2>Patient History</h2>
          <p>Records saved under your account.</p>
        </div>
        <div className="history-search">
          <input
            type="text"
            placeholder="Search by patient name"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading && <div className="history-status">Loading records...</div>}
      {error && <div className="history-error">{error}</div>}
      {!loading && records.length === 0 && (
        <div className="history-empty">No patient records saved yet.</div>
      )}

      {records.length > 0 && (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Ayush</th>
              <th>ICD-11</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record._id}>
                <td>{formatDate(record.createdAt)}</td>
                <td>{record.patientName}</td>
                <td>{record.ayushDiagnosis || 'N/A'}</td>
                <td>{record.icd11Diagnosis || 'N/A'}</td>
                <td>
                  <button
                    className="table-btn"
                    type="button"
                    onClick={() => setSelected(record)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="history-details">
          <div className="details-header">
            <div>
              <h3>{selected.patientName}</h3>
              <p>{formatDate(selected.createdAt)}</p>
            </div>
            <button className="print-btn" type="button" onClick={() => handlePrint(selected)}>
              Print Prescription
            </button>
          </div>

          <div className="details-grid">
            <div className="details-card">
              <h4>Ayush Diagnosis</h4>
              <p>{selected.ayushDiagnosis || 'N/A'}</p>
              <span>Code: {selected.ayushCode || 'N/A'}</span>
            </div>
            <div className="details-card">
              <h4>ICD-11 Diagnosis</h4>
              <p>{selected.icd11Diagnosis || 'N/A'}</p>
              <span>Code: {selected.icd11Code || 'N/A'}</span>
            </div>
            <div className="details-card">
              <h4>Patient Info</h4>
              <p>Age: {selected.age}</p>
              <span>Gender: {selected.gender || 'N/A'}</span>
            </div>
          </div>

          <div className="details-notes">
            <h4>Clinical Reasoning</h4>
            <p>{selected.reasoning || 'N/A'}</p>
            <div className="details-summary">
              <strong>Medical Summary:</strong> {selected.description || 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
