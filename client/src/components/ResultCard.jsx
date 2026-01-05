import React from 'react';

const ResultCard = ({ data, onSave }) => {
  if (!data) return null;

  return (
    <div className="result-card">
      <div className="card-header">
        <h1 style={{margin:0}}>{data.diseaseName}</h1>
        <span className="confidence-badge">
          Match: {data.confidenceScore}%
        </span>
      </div>

      <div className="codes-grid">
        <div className="code-box ayush">
          <h3>NAMASTE / AYUSH</h3>
          <p>{data.ayushCode}</p>
        </div>
        <div className="code-box icd">
          <h3>WHO ICD-11</h3>
          <p>{data.icdCode}</p>
        </div>
      </div>

      <p className="description">
        "{data.description}"
      </p>

      <button className="save-btn" onClick={onSave}>
        Save to Patient Record (EMR)
      </button>
    </div>
  );
};

export default ResultCard;