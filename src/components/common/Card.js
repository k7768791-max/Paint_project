// src/components/common/Card.js
import React from 'react';

const Card = ({ title, subtitle, action, children, style = {}, className = '' }) => (
  <div className={`card ${className}`} style={style}>
    {(title || action) && (
      <div className="card-header">
        <div>
          {title && <div className="card-title">{title}</div>}
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default Card;