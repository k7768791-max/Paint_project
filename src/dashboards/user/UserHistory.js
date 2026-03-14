// src/dashboards/user/UserHistory.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { SkeletonTable } from '../../components/common/Skeleton';

const UserHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reuseData, setReuseData] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'predictions'),
      where('uid', '==', user.uid),
      where('role', '==', 'user'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user?.uid]);

  const formatDate = (ts) => {
    if (!ts?.seconds) return '-';
    return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filtered = history.filter(h => {
    if (!dateFrom && !dateTo) return true;
    const ts = h.createdAt?.seconds ? new Date(h.createdAt.seconds * 1000) : null;
    if (!ts) return true;
    if (dateFrom && ts < new Date(dateFrom)) return false;
    if (dateTo && ts > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['#', 'Type', 'Surface', 'Environment', 'Finish', 'Durability', 'Result Color', 'Date'];
    const rows = filtered.map((h, i) => [
      i + 1,
      h.type || 'color_recommendation',
      h.input?.surface_type || '-',
      h.input?.environment || '-',
      h.input?.finish || '-',
      h.input?.durability || '-',
      h.output?.recommended_color || '-',
      formatDate(h.createdAt)
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chromaai_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReuse = (h) => {
    // Navigate to recommend page with prefill state
    navigate('/user/recommend', { state: { prefill: h.input } });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Prediction History" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">📋 My History</h1>
            <p className="page-subtitle">All your previous color recommendations and predictions</p>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--accent-glow)' }}>📊</div>
              <div className="stat-value">{history.length}</div>
              <div className="stat-label">Total Predictions</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>📅</div>
              <div className="stat-value">
                {history.filter(h => {
                  const ts = h.createdAt?.seconds;
                  if (!ts) return false;
                  const d = new Date(ts * 1000);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <div className="stat-label">This Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>🎨</div>
              <div className="stat-value">
                {[...new Set(history.map(h => h.output?.recommended_color).filter(Boolean))].length}
              </div>
              <div className="stat-label">Unique Colors</div>
            </div>
          </div>

          {/* Filter + Export */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>From:</label>
              <input type="date" className="form-control" style={{ width: 160 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>To:</label>
              <input type="date" className="form-control" style={{ width: 160 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            {(dateFrom || dateTo) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <span className="badge badge-info" style={{ padding: '6px 12px' }}>
                {filtered.length} records
              </span>
              <button className="btn btn-secondary btn-sm" onClick={exportCSV}>📥 Export CSV</button>
              <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨️ Export PDF</button>
            </div>
          </div>

          {loading ? (
            <SkeletonTable rows={6} />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📋</span>
              <div className="empty-state-text">
                {history.length === 0
                  ? 'No predictions yet. Start your first color recommendation!'
                  : 'No results in this date range.'}
              </div>
              {history.length === 0 && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/user/recommend')}>
                  🎨 Get First Recommendation
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Surface</th>
                    <th>Environment</th>
                    <th>Finish</th>
                    <th>Result Color</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h, i) => (
                    <tr key={h.id}>
                      <td style={{ color: 'var(--text-muted)' }}>#{i + 1}</td>
                      <td><span className="badge badge-info">AI Recommend</span></td>
                      <td>{h.input?.surface_type || '-'}</td>
                      <td>{h.input?.environment || '-'}</td>
                      <td>{h.input?.finish || '-'}</td>
                      <td>
                        <strong style={{ color: 'var(--accent)' }}>
                          {h.output?.recommended_color || '-'}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {formatDate(h.createdAt)}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleReuse(h)}
                          title="Reuse this input"
                        >
                          🔄 Reuse
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistory;