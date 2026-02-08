import React from 'react';

const Navbar = ({ isAuthed, user, view, onViewChange, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <h2>
          <span className="green">AYUSH</span>
          <span className="blue">ICD</span> Assistant
        </h2>
      </div>

      {isAuthed ? (
        <div className="nav-right">
          <div className="nav-links">
            <button
              type="button"
              className={`nav-link ${view === 'vaidya' ? 'active' : ''}`}
              onClick={() => onViewChange('vaidya')}
            >
              AI Vaidya
            </button>
            <button
              type="button"
              className={`nav-link ${view === 'history' ? 'active' : ''}`}
              onClick={() => onViewChange('history')}
            >
              Patient History
            </button>
          </div>
          <div className="user-chip">
            <div className="user-name">{user?.name || 'Doctor'}</div>
            <div className="user-sub">{user?.specialization || ''}</div>
          </div>
          <button className="logout-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="nav-right">
          <div className="nav-muted">Doctor Login</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
