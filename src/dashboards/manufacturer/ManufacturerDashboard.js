// src/dashboards/manufacturer/ManufacturerDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { SkeletonStatsGrid } from '../../components/common/Skeleton';

const ManufacturerDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'predictions'),
      where('uid', '==', user.uid),
      where('role', '==', 'manufacturer'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setPredictions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user?.uid]);

  const recentBatches = predictions.slice(0, 10);
  const qualityPredictions = predictions.filter(p => p.type === 'quality_prediction');
  const avgQuality = qualityPredictions.length > 0
    ? Math.round(qualityPredictions.reduce((sum, p) => sum + (p.output?.quality_score || 0), 0) / qualityPredictions.length)
    : 0;
  const avgPurity = qualityPredictions.length > 0
    ? Math.round(qualityPredictions.reduce((sum, p) => sum + (p.output?.purity || 0), 0) / qualityPredictions.length)
    : 0;
  const failedBatches = qualityPredictions.filter(p => (p.output?.quality_score || 0) < 75).length;

  const stats = [
    { icon: '🔬', value: predictions.length, label: 'Total Predictions', change: '+6 this week', up: true, bg: 'var(--accent-glow)' },
    { icon: '✅', value: avgQuality ? `${avgQuality}%` : 'N/A', label: 'Avg Quality Score', change: 'Based on recent batches', up: true, bg: 'rgba(16,185,129,0.1)' },
    { icon: '⚗️', value: avgPurity ? `${avgPurity}%` : 'N/A', label: 'Avg Purity Level', change: 'Quality predictions only', bg: 'rgba(59,130,246,0.1)' },
    { icon: '❌', value: failedBatches, label: 'Failed Batches', change: 'Quality score < 75%', bg: 'rgba(239,68,68,0.1)' },
  ];

  const formatDate = (ts) => {
    if (!ts?.seconds) return '-';
    return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getBatchStatus = (p) => {
    const score = p.output?.quality_score;
    if (!score) return { label: 'Pending', cls: 'badge-warning' };
    if (score >= 90) return { label: 'Passed', cls: 'badge-success' };
    if (score >= 75) return { label: 'Review', cls: 'badge-warning' };
    return { label: 'Failed', cls: 'badge-danger' };
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Manufacturer Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">🏭 Production Overview</h1>
            <p className="page-subtitle">Monitor your chemical formulations and production quality</p>
          </div>

          {loading ? <SkeletonStatsGrid count={4} /> : (
            <div className="stats-grid">
              {stats.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className={`stat-change ${s.up ? 'up' : ''}`}>{s.change}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
            <Card title="🔬 Predict Color from Formula" subtitle="Enter pigment & solvent data to get color prediction">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                Model 2: Input your chemical composition and get the resulting paint color prediction instantly.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/manufacturer/predict')}>
                Run Color Prediction →
              </button>
            </Card>

            <Card title="⚗️ Optimize Production Quality" subtitle="Get quality score and improvement suggestions">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                Model 3: Input production conditions to predict viscosity, purity, and get a quality optimization report.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/manufacturer/quality')}>
                Run Quality Optimizer →
              </button>
            </Card>
          </div>

          {/* Recent Batches */}
          <Card title="Recent Production Batches" subtitle="Latest batch quality records"
            action={<span className="badge badge-success">Live</span>}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading...</div>
            ) : recentBatches.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🏭</span>
                <div className="empty-state-text">No predictions yet. Run your first color or quality prediction.</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Color / Input</th>
                      <th>Quality Score</th>
                      <th>Purity</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBatches.map(b => {
                      const status = getBatchStatus(b);
                      const score = b.output?.quality_score;
                      return (
                        <tr key={b.id}>
                          <td>
                            <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                              {b.type === 'quality_prediction' ? 'Quality' : 'Color'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {b.output?.predicted_color || b.input?.color || '-'}
                            </span>
                          </td>
                          <td>
                            {score ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="progress-bar" style={{ width: 80 }}>
                                  <div className="progress-fill" style={{
                                    width: `${score}%`,
                                    background: score >= 90
                                      ? 'linear-gradient(90deg,#10B981,#34D399)'
                                      : score >= 75
                                        ? 'linear-gradient(90deg,#F59E0B,#FCD34D)'
                                        : 'linear-gradient(90deg,#EF4444,#F87171)'
                                  }} />
                                </div>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{score}%</span>
                              </div>
                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>
                          <td>{b.output?.purity ? `${b.output.purity}%` : '—'}</td>
                          <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(b.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;