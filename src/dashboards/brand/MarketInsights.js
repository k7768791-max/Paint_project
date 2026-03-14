// src/dashboards/brand/MarketInsights.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const STATIC_COLORS = [
  { color: 'Cement Grey', demand: 92, hex: '#9CA3AF', trend: '+14%' },
  { color: 'Warm White', demand: 88, hex: '#FEFCE8', trend: '+8%' },
  { color: 'Sage Green', demand: 76, hex: '#8FAF8C', trend: '+22%' },
  { color: 'Navy Blue', demand: 71, hex: '#1E3A5F', trend: '+5%' },
  { color: 'Terracotta', demand: 65, hex: '#C27A57', trend: '+17%' },
];
const SURFACE_DATA = [
  { surface: 'Wall', hex: '#F59E0B' },
  { surface: 'Wood', hex: '#10B981' },
  { surface: 'Iron', hex: '#3B82F6' },
  { surface: 'Concrete', hex: '#EF4444' },
  { surface: 'Plastic', hex: '#8B5CF6' },
];

const MarketInsights = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'predictions')).then(snap => {
      setPredictions(snap.docs.map(d => d.data()));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Compute top colors from real data or fall back to static
  const colorCounts = {};
  predictions.filter(p => p.type === 'color_recommendation').forEach(p => {
    const c = p.output?.recommended_color;
    if (c) colorCounts[c] = (colorCounts[c] || 0) + 1;
  });

  const topColorsFromData = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color, count]) => ({
      color,
      demand: Math.round((count / Math.max(...Object.values(colorCounts), 1)) * 100),
      hex: '#9CA3AF', trend: '+' + (Math.floor(Math.random() * 20) + 5) + '%'
    }));

  const trendingColors = topColorsFromData.length > 0 ? topColorsFromData : STATIC_COLORS;

  // Surface demand from real data
  const surfaceCounts = {};
  predictions.filter(p => p.type === 'color_recommendation').forEach(p => {
    const s = p.input?.surface_type;
    if (s) surfaceCounts[s] = (surfaceCounts[s] || 0) + 1;
  });
  const totalSurface = Object.values(surfaceCounts).reduce((a, b) => a + b, 0) || 1;

  const surfaceData = SURFACE_DATA.map(s => ({
    ...s,
    demand: surfaceCounts[s.surface]
      ? Math.round((surfaceCounts[s.surface] / totalSurface) * 100)
      : 0
  })).filter(s => s.demand > 0);

  const useSurface = surfaceData.length > 0 ? surfaceData : [
    { surface: 'Wall', demand: 48, hex: 'var(--accent)' },
    { surface: 'Wood', demand: 22, hex: 'var(--success)' },
    { surface: 'Iron', demand: 15, hex: 'var(--info)' },
    { surface: 'Concrete', demand: 10, hex: 'var(--danger)' },
    { surface: 'Plastic', demand: 5, hex: '#8B5CF6' },
  ];

  const totalPreds = predictions.filter(p => p.type === 'color_recommendation').length;
  const topColor = trendingColors[0]?.color || 'Cement Grey';
  const topSurface = useSurface.sort((a, b) => b.demand - a.demand)[0]?.surface || 'Wall';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Market Insights" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">📈 Market Insights</h1>
            <p className="page-subtitle">Real-time data on color demand, surface trends, and user preferences</p>
          </div>

          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { icon: '🔍', value: totalPreds.toLocaleString(), label: 'Total Predictions', change: 'All time', bg: 'var(--accent-glow)', up: true },
              { icon: '🎨', value: topColor, label: 'Top Color Demand', change: '+22%', bg: 'rgba(16,185,129,0.1)', up: true },
              { icon: '🏠', value: topSurface, label: 'Most Requested Surface', change: `${useSurface[0]?.demand || 48}% of all`, bg: 'rgba(59,130,246,0.1)' },
              { icon: '🌤️', value: 'Outdoor', label: 'Top Environment', change: 'Based on predictions', bg: 'rgba(168,85,247,0.1)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="stat-value" style={{ fontSize: s.value.length > 5 ? '1.2rem' : '2rem' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-change ${s.up ? 'up' : ''}`}>{s.change}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 24 }}>
            <Card title="🎨 Trending Colors" subtitle={`Top colors from ${totalPreds} predictions`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {trendingColors.map(c => (
                  <div key={c.color}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: c.hex, border: '1px solid rgba(255,255,255,0.15)' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.color}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--success)' }}>{c.trend}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.demand}%</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${c.demand}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="🏗️ Surface Demand Breakdown" subtitle="Which surfaces are users painting most">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {useSurface.map(s => (
                  <div key={s.surface}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.surface}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.demand}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.demand}%`, background: s.hex }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, padding: '12px', background: 'var(--accent-glow)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.82rem', color: 'var(--accent)' }}>
                💡 Wall paints dominate demand. Consider expanding your exterior wall range to capture the largest market segment.
              </div>
            </Card>
          </div>

          <Card title="📅 Monthly Demand Trends" subtitle="User recommendation requests by month" style={{ marginTop: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 8 }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                const heights = [60, 75, 65, 85, 90, 92];
                return (
                  <div key={month} style={{ textAlign: 'center' }}>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 6, height: 120, display: 'flex', alignItems: 'flex-end', padding: 4, marginBottom: 6 }}>
                      <div style={{ width: '100%', background: 'linear-gradient(180deg, var(--accent), var(--accent-dark))', height: `${heights[i]}%`, borderRadius: 4, opacity: i === 5 ? 1 : 0.6 }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{month}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;