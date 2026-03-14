// src/dashboards/manufacturer/ManufacturerPredictionPage.js
import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import ManufacturerPredictionForm from '../../components/forms/ManufacturerPredictionForm';

const COLOR_HEX_MAP = {
  'Crimson Red': '#DC143C', 'Ocean Blue': '#006994', 'Forest Green': '#228B22',
  'Golden Yellow': '#FFD700', 'Jet Black': '#1C1C1C', 'Pure White': '#F8F8FF',
  'Burnt Orange': '#CC5500', 'Chocolate Brown': '#7B3F00', 'Slate Grey': '#708090',
  'Ivory Cream': '#FFFFF0', 'Navy Blue': '#000080', 'Olive Green': '#808000',
};

const getColorHex = (colorName) => {
  if (!colorName) return '#9CA3AF';
  const found = Object.keys(COLOR_HEX_MAP).find(k =>
    colorName.toLowerCase().includes(k.toLowerCase().split(' ')[0])
  );
  return found ? COLOR_HEX_MAP[found] : '#9CA3AF';
};

const ManufacturerPredictionPage = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Color Predictor (Model 1)" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">🔬 Color Predictor</h1>
            <p className="page-subtitle">Enter your chemical formulation to predict the resulting paint color</p>
          </div>

          <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
            <Card title="Chemical Formulation" subtitle="Model 1 Input">
              <ManufacturerPredictionForm onResult={setResult} />
            </Card>

            <div>
              {!result ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🔬</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Awaiting Formulation Data</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Enter your pigment and solvent data to see the predicted paint color
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="result-box">
                    <div className="result-title">🎯 Color Prediction Result</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                      <div style={{
                        width: 80, height: 80, borderRadius: 14,
                        background: getColorHex(result.predicted_color),
                        border: '2px solid rgba(255,255,255,0.15)',
                        flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                      }} />
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                          {result.predicted_color}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          Predicted Color Value
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-ghost btn-sm" onClick={() => setResult(null)}>← New Prediction</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerPredictionPage;