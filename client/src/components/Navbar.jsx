import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <h2>
          <span className="green">AYUSH</span>
          <span className="blue">ICD</span> Assistant
        </h2>
      </div>
      <div style={{color: '#6b7280'}}>v1.0 Prototype</div>
    </nav>
  );
};

export default Navbar;