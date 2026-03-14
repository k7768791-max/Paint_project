// src/components/common/Loader.js
import React from 'react';

const Loader = ({ inline = false, text = 'Loading...' }) => {
  if (inline) {
    return (
      <div className="loader-inline">
        <div className="spin" />
        {text}
      </div>
    );
  }
  return (
    <div className="loader-overlay">
      <div style={{ textAlign: 'center' }}>
        <div className="loader-spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{text}</div>
      </div>
    </div>
  );
};

export default Loader;