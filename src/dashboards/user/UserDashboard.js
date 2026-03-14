// src/dashboards/user/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { SkeletonStatsGrid, SkeletonCard } from '../../components/common/Skeleton';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const plan = userProfile?.subscription || 'free';
  const FREE_LIMIT = 3;

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'predictions'),
      where('uid', '==', user.uid),
      where('role', '==', 'user'),
      orderBy('createdAt', 'desc') // Removed limit(5) to get accurate stats
    );
    const unsub = onSnapshot(q, snap => {
      setPredictions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user?.uid]);

  const thisMonthPreds = predictions.filter(p => {
    const ts = p.createdAt?.seconds;
    if (!ts) return false;
    const d = new Date(ts * 1000);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const uniqueColors = [...new Set(predictions.map(p => p.output?.recommended_color).filter(Boolean))];

  const formatDate = (ts) => {
    if (!ts?.seconds) return '-';
    const d = new Date(ts.seconds * 1000);
    const diff = Math.floor((Date.now() / 1000) - ts.seconds);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stats = [
    { icon: '🎨', value: predictions.length, label: 'Total Predictions', change: 'All time', bg: 'var(--accent-glow)', up: true },
    { icon: '📅', value: `${thisMonthPreds}/${plan === 'free' ? FREE_LIMIT : '∞'}`, label: 'This Month', change: plan === 'free' ? 'Free plan limit' : 'Unlimited plan', bg: 'rgba(16,185,129,0.1)', up: true },
    { icon: '✨', value: uniqueColors.length, label: 'Unique Colors', change: 'Discovered so far', bg: 'rgba(59,130,246,0.1)' },
    { icon: '⭐', value: plan.toUpperCase(), label: 'Current Plan', change: plan === 'free' ? 'Upgrade for more' : 'Active subscription', bg: 'rgba(168,85,247,0.1)' },
  ];

  const quickActions = [
    { icon: '🎨', title: 'Color Recommendation', desc: 'AI-powered color selection for your project', path: '/user/recommend', color: 'var(--accent-glow)' },
    { icon: '📋', title: 'My History', desc: 'Review past predictions and reuse them', path: '/user/history', color: 'rgba(59,130,246,0.1)' },
    { icon: '💳', title: 'Upgrade Plan', desc: 'Unlock unlimited predictions', path: '/pricing', color: 'rgba(16,185,129,0.1)' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="User Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">
              👋 Welcome back, {userProfile?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="page-subtitle">
              Your AI-powered paint intelligence dashboard
            </p>
          </div>

          {/* Free plan alert */}
          {plan === 'free' && thisMonthPreds >= FREE_LIMIT - 1 && (
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>
              ⚡ You've used <strong>{thisMonthPreds}/{FREE_LIMIT}</strong> predictions this month.
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={() => navigate('/pricing')}>
                Upgrade for Unlimited →
              </button>
            </div>
          )}

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

          <div className="grid-2" style={{ gap: 24 }}>
            {/* Quick Actions */}
            <Card title="⚡ Quick Actions" subtitle="Jump directly to what matters">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {quickActions.map(q => (
                  <div
                    key={q.title}
                    onClick={() => navigate(q.path)}
                    style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 10, cursor: 'pointer', transition: 'var(--transition)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{q.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{q.desc}</div>
                    </div>
                    <div style={{ color: 'var(--accent)' }}>→</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Predictions */}
            {loading ? <SkeletonCard /> : (
              <Card title="📜 Recent Predictions" subtitle="Your last 5 color recommendations"
                action={
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/user/history')}>
                    View All →
                  </button>
                }
              >
                {predictions.length === 0 ? (
                  <div className="empty-state" style={{ padding: '28px 0' }}>
                    <span className="empty-state-icon" style={{ fontSize: 36 }}>🎨</span>
                    <div className="empty-state-text">No predictions yet. Try your first color recommendation!</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/user/recommend')}>
                      Get Started →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {predictions.slice(0, 5).map(p => (
                      <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent)', flex: 1 }}>
                          {p.output?.recommended_color || 'Unknown'}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {p.input?.surface_type || '-'} / {p.input?.environment || '-'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatDate(p.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Trending Color Palette */}
          <Card title="🌈 Trending Colors This Month" subtitle="Most popular recommendations across ChromaAI" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '8px 0' }}>
              {[
                { name: 'Cement Grey', hex: '#9CA3AF' },
                { name: 'Warm White', hex: '#FEFCE8' },
                { name: 'Navy Blue', hex: '#1E3A5F' },
                { name: 'Sage Green', hex: '#8FAF8C' },
                { name: 'Terracotta', hex: '#C27A57' },
                { name: 'Charcoal', hex: '#374151' },
                { name: 'Beige', hex: '#F5E6C8' },
                { name: 'Olive Green', hex: '#6B7C45' },
              ].map(c => (
                <div key={c.name} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/user/recommend')}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: c.hex, border: '2px solid var(--border)', marginBottom: 6, transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{c.name}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;