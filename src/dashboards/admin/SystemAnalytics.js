// src/dashboards/admin/SystemAnalytics.js
import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';

const monthlyData = [
  { month: 'Jan', users: 820, predictions: 4200, revenue: 12400 },
  { month: 'Feb', users: 940, predictions: 5100, revenue: 14200 },
  { month: 'Mar', users: 1020, predictions: 5800, revenue: 15100 },
  { month: 'Apr', users: 1100, predictions: 6400, revenue: 16300 },
  { month: 'May', users: 1200, predictions: 7200, revenue: 17400 },
  { month: 'Jun', users: 1284, predictions: 8941, revenue: 18420 },
];

const topColors = [
  { color: 'Cement Grey', count: 1241, pct: 100 },
  { color: 'Warm White', count: 986, pct: 79 },
  { color: 'Navy Blue', count: 742, pct: 60 },
  { color: 'Sage Green', count: 641, pct: 52 },
  { color: 'Terracotta', count: 498, pct: 40 },
];

const SystemAnalytics = () => {
  const [tab, setTab] = useState('users');
  const maxVal = { users: 1284, predictions: 8941, revenue: 18420 };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="System Analytics" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">📈 System Analytics</h1>
            <p className="page-subtitle">Full platform performance metrics and growth tracking</p>
          </div>

          <div className="stats-grid">
            {[
              { icon: '📈', value: '+56%', label: 'User Growth (6mo)', bg: 'var(--accent-glow)' },
              { icon: '🤖', value: '+112%', label: 'Prediction Growth', bg: 'rgba(16,185,129,0.1)' },
              { icon: '💰', value: '+48%', label: 'Revenue Growth', bg: 'rgba(59,130,246,0.1)' },
              { icon: '⏱️', value: '142ms', label: 'Avg API Response', bg: 'rgba(168,85,247,0.1)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <Card title="📊 Monthly Growth" subtitle="Users, predictions and revenue over 6 months"
            action={
              <div className="tabs" style={{ margin: 0, width: 'auto' }}>
                {['users', 'predictions', 'revenue'].map(t => (
                  <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}
                    style={{ flex: 'none', padding: '6px 14px', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            }>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 200, padding: '8px 0' }}>
              {monthlyData.map((d, i) => {
                const val = d[tab];
                const pct = (val / maxVal[tab]) * 100;
                return (
                  <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {tab === 'revenue' ? `$${(val / 1000).toFixed(0)}k` : val > 999 ? `${(val / 1000).toFixed(1)}k` : val}
                    </div>
                    <div style={{ width: '100%', background: 'var(--bg-elevated)', borderRadius: 6, flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{
                        width: '100%',
                        height: `${pct}%`,
                        background: i === monthlyData.length - 1
                          ? 'linear-gradient(180deg, var(--accent), var(--accent-dark))'
                          : 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        minHeight: 8,
                        transition: 'all 0.3s ease',
                        opacity: i === monthlyData.length - 1 ? 1 : 0.5 + (i * 0.08)
                      }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.month}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid-2" style={{ gap: 24, marginTop: 24 }}>
            {/* Top Colors */}
            <Card title="🎨 Most Predicted Colors" subtitle="Top 5 colors across all models">
              {topColors.map(c => (
                <div key={c.color} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.color}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.count.toLocaleString()} predictions</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </Card>

            {/* System Health */}
            <Card title="💚 System Health" subtitle="Real-time infrastructure status">
              {[
                { service: 'FastAPI Backend', status: 'Operational', uptime: '99.9%', latency: '142ms' },
                { service: 'ML Model Server', status: 'Operational', uptime: '99.7%', latency: '380ms' },
                { service: 'Firebase Auth', status: 'Operational', uptime: '100%', latency: '45ms' },
                { service: 'Firestore DB', status: 'Operational', uptime: '99.9%', latency: '67ms' },
              ].map(s => (
                <div key={s.service} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.service}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uptime: {s.uptime} · {s.latency}</div>
                  </div>
                  <span className="badge badge-success">{s.status}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;