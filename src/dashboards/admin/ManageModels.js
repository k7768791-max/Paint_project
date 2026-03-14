// src/dashboards/admin/ManageModels.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const MODEL_INFO = [
  {
    id: 'model1', name: 'Color Recommendation AI', icon: '🎨',
    description: 'Predicts the ideal paint color for a surface based on environment, finish, durability, and preferences.',
    version: 'v2.4.1', type: 'Classification', framework: 'Scikit-learn',
    accuracy: 94, status: 'Operational', lastRetrained: '2025-05-15',
    features: ['Surface Type', 'Environment', 'Finish', 'Durability', 'Weather Resistance'],
    route: '/user/recommend'
  },
  {
    id: 'model2', name: 'Chemical Color Predictor', icon: '🔬',
    description: 'Predicts resulting paint color from chemical formulation — pigment composition, solvent ratio, and surface type.',
    version: 'v1.8.2', type: 'Multi-class Classification', framework: 'Random Forest',
    accuracy: 89, status: 'Operational', lastRetrained: '2025-04-30',
    features: ['Pigment Composition', 'Solvent Ratio', 'Additives', 'Surface Type'],
    route: '/manufacturer/predict'
  },
  {
    id: 'model3', name: 'Production Quality Optimizer', icon: '⚗️',
    description: 'Predicts paint batch quality score, viscosity, and purity from production conditions and chemical inputs.',
    version: 'v3.1.0', type: 'Regression', framework: 'Gradient Boosting',
    accuracy: 97, status: 'Operational', lastRetrained: '2025-06-01',
    features: ['Temperature', 'Mixing Time', 'Pigment Ratio', 'Solvent Ratio', 'Production Conditions'],
    route: '/manufacturer/quality'
  },
];

const ManageModels = () => {
  const [selected, setSelected] = useState(MODEL_INFO[0]);
  const [predCounts, setPredCounts] = useState({ model1: 0, model2: 0, model3: 0 });
  const [retrainLogs, setRetrainLogs] = useState([
    { date: '2025-06-01', model: 'Production Quality Optimizer', accuracy: 97, improvement: '+1.2%' },
    { date: '2025-05-15', model: 'Color Recommendation AI', accuracy: 94, improvement: '+2.1%' },
    { date: '2025-04-30', model: 'Chemical Color Predictor', accuracy: 89, improvement: '+3.4%' },
    { date: '2025-04-01', model: 'Color Recommendation AI', accuracy: 91.9, improvement: '+0.9%' },
  ]);

  useEffect(() => {
    const counts = { model1: 0, model2: 0, model3: 0 };
    const unsub = onSnapshot(collection(db, 'predictions'), snap => {
      snap.docs.forEach(d => {
        const type = d.data().type;
        if (type === 'color_recommendation') counts.model1++;
        else if (type === 'manufacturer_color') counts.model2++;
        else if (type === 'quality_prediction') counts.model3++;
      });
      setPredCounts({ ...counts });
    }, () => { });
    return unsub;
  }, []);

  const COUNTS = {
    'model1': predCounts.model1,
    'model2': predCounts.model2,
    'model3': predCounts.model3,
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="ML Model Monitor" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">🤖 ML Model Monitor</h1>
            <p className="page-subtitle">Track accuracy, usage, and health of all AI models</p>
          </div>

          {/* Summary Stats */}
          <div className="stats-grid">
            {[
              { icon: '🤖', value: '3', label: 'Active Models', bg: 'var(--accent-glow)' },
              { icon: '📊', value: `${predCounts.model1 + predCounts.model2 + predCounts.model3}`, label: 'Total Predictions', bg: 'rgba(16,185,129,0.1)' },
              { icon: '✅', value: '93.3%', label: 'Avg Accuracy', bg: 'rgba(59,130,246,0.1)' },
              { icon: '📅', value: 'Jun 01', label: 'Last Retrain', bg: 'rgba(168,85,247,0.1)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 24 }}>
            {/* Model Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MODEL_INFO.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelected(m)}
                  style={{
                    background: selected.id === m.id ? 'rgba(245,158,11,0.06)' : 'var(--bg-card)',
                    border: `1px solid ${selected.id === m.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', padding: 20, cursor: 'pointer', transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 32 }}>{m.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{m.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{m.type} · {m.framework}</div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>Accuracy</div>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill" style={{ width: `${m.accuracy}%`, background: m.accuracy >= 95 ? 'var(--success)' : m.accuracy >= 88 ? 'var(--accent)' : 'var(--danger)' }} />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{m.accuracy}%</span>
                        <span className="badge badge-success" style={{ marginLeft: 'auto' }}>● {m.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Model Detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card title={`${selected.icon} ${selected.name}`} subtitle={selected.description}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    ['Version', selected.version],
                    ['Framework', selected.framework],
                    ['Accuracy', `${selected.accuracy}%`],
                    ['Total Uses', COUNTS[selected.id]?.toLocaleString() || '0'],
                    ['Last Retrained', selected.lastRetrained],
                    ['Status', selected.status],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{k}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Input Features</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.features.map(f => <span key={f} className="badge badge-info">{f}</span>)}
                  </div>
                </div>
              </Card>

              {/* Retrain Log */}
              <Card title="📅 Retraining History" subtitle="Recent model update sessions">
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Date</th><th>Model</th><th>Accuracy</th><th>Improvement</th></tr></thead>
                    <tbody>
                      {retrainLogs.map((log, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.date}</td>
                          <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{log.model}</td>
                          <td><span className="badge badge-info">{log.accuracy}%</span></td>
                          <td style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem' }}>{log.improvement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageModels;