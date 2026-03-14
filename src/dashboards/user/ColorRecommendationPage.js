// src/dashboards/user/ColorRecommendationPage.js
import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import ColorRecommendationForm from '../../components/forms/ColorRecommendationForm';

const ColorRecommendationPage = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Paint Recommendation System (Model 3)" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">🎨 Paint Recommendation</h1>
            <p className="page-subtitle">Get AI-driven paint recommendations for your specific needs</p>
          </div>

          <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
            <Card title="Project Requirements" subtitle="Describe your space and preferences">
              <ColorRecommendationForm onResult={setResult} />
            </Card>

            <div>
              {!result ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🎨</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Awaiting Project Details</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Fill out the form and click "Get Recommendation" to see your personalized AI results
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="result-box">
                    <div className="result-title">✨ Recommended Approach</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                      <div className="result-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                        <span className="result-key">Recommended Color</span>
                        <span className="result-value" style={{fontSize: '1.2rem', color: 'var(--primary)'}}>{result.recommended_color}</span>
                      </div>
                      <div className="result-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                        <span className="result-key">Paint Type</span>
                        <span className="result-value" style={{fontSize: '1.2rem'}}>{result.recommended_paint_type}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="result-item"><span className="result-key">Viscosity (ml)</span><span className="result-value">{result.predicted_viscosity_ml}</span></div>
                      <div className="result-item"><span className="result-key">Required Purity</span><span className="result-value" style={{color: 'var(--success)'}}>{result.required_purity}</span></div>
                      <div className="result-item"><span className="result-key">Recommended Coats</span><span className="result-value">{result.recommended_coats}</span></div>
                      <div className="result-item"><span className="result-key">Durability (Years)</span><span className="result-value">{result.expected_durability_years}</span></div>
                      <div className="result-item"><span className="result-key">Drying Time (min)</span><span className="result-value">{result.estimated_drying_time_min}</span></div>
                      <div className="result-item"><span className="result-key">Paint Requirement</span><span className="result-value">{result.paint_requirement}</span></div>
                    </div>
                  </div>

                  {result.recommendations?.length > 0 && (
                    <Card title="💡 Recommendation Tips" subtitle="Best practices for your project">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {result.recommendations.map((r, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.875rem', border: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <button className="btn btn-secondary btn-sm" onClick={() => setResult(null)}>← New Prediction</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ColorRecommendationPage;