// src/dashboards/manufacturer/ProductionQualityPage.js
import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import QualityPredictionForm from '../../components/forms/QualityPredictionForm';

const ProductionQualityPage = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Production Quality Prediction (Model 2)" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">⚗️ Production Quality Prediction</h1>
            <p className="page-subtitle">Predict viscosity, purity and get actionable suggestions</p>
          </div>

          <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
            <Card title="Production Parameters" subtitle="Model 2 Input Form">
              <QualityPredictionForm onResult={setResult} />
            </Card>

            <div>
              {!result ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>⚗️</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Ready for Prediction</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Enter production parameters to get quality and purity predictions.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Metrics */}
                  <div className="result-box">
                    <div className="result-title">📊 Predicted Quality Metrics</div>
                    <div className="result-item">
                      <span className="result-key">Viscosity</span>
                      <span className="result-value">{result.viscosity?.toLocaleString() || '-'}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-key">Purity Layer</span>
                      <span className="result-value" style={{ color: 'var(--success)' }}>{result.purity}</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {result.suggestions?.length > 0 && (
                    <Card title="💡 Suggestions" subtitle="Actions to improve quality">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {result.suggestions.map((r, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.875rem', border: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <button className="btn btn-ghost btn-sm" onClick={() => setResult(null)}>← New Analysis</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductionQualityPage;