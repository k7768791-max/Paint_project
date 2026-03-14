// src/dashboards/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { SkeletonStatsGrid } from '../../components/common/Skeleton';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0, manufacturers: 0, monthlyRevenue: 0,
    salesCommission: 0,
    predictions: 0, activeBrandAds: 0
  });
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [brandSales, setBrandSales] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user stats
    const usersUnsub = onSnapshot(collection(db, 'users'), snap => {
      const users = snap.docs.map(d => d.data());
      const manufacturers = users.filter(u => u.role === 'manufacturer').length;
      setStats(prev => ({ ...prev, totalUsers: users.length, manufacturers }));
    });

    // Fetch prediction count
    const predsUnsub = onSnapshot(collection(db, 'predictions'), snap => {
      setStats(prev => ({ ...prev, predictions: snap.size }));
    });

    // Fetch active brand ads
    const adsQ = query(collection(db, 'brand_ads'), where('status', '==', 'approved'));
    const adsUnsub = onSnapshot(adsQ, snap => {
      setStats(prev => ({ ...prev, activeBrandAds: snap.size }));
    });

    // Fetch subscriptions for monthly revenue
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const subsUnsub = onSnapshot(collection(db, 'subscriptions'), snap => {
      const subs = snap.docs.map(d => d.data());
      const monthSubs = subs.filter(s => {
        const ts = s.createdAt?.seconds;
        return ts && new Date(ts * 1000) >= monthStart;
      });
      const revenue = monthSubs.reduce((sum, s) => sum + (s.amount || 0), 0);
      setStats(prev => ({ ...prev, monthlyRevenue: revenue }));

      // Fetch orders for commission and brand sales
      const ordersUnsub = onSnapshot(collection(db, 'orders'), snap => {
        const _orders = snap.docs.map(d => d.data());
        const monthOrders = _orders.filter(o => {
          const ts = o.createdAt?.seconds;
          return ts && new Date(ts * 1000) >= monthStart;
        });

        // Commission is flat ₹10 per order inside the platform logic
        const commission = monthOrders.length * 10;
        
        // Brand-wise sales aggregation
        const brandGroups = _orders.reduce((acc, order) => {
           if (!order.brandName) return acc;
           acc[order.brandName] = (acc[order.brandName] || 0) + (order.price * order.qty);
           return acc;
        }, {});
        
        const sortedBrands = Object.entries(brandGroups)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // top 5

        setStats(prev => ({ ...prev, salesCommission: commission }));
        setBrandSales(sortedBrands);

        const totalRev = revenue + commission || 1;
        setRevenueBreakdown([
          { label: 'Subscription Plans', value: `₹${revenue.toLocaleString()}`, pct: Math.round((revenue / totalRev) * 100), color: 'var(--accent)' },
          { label: 'Sales Commission', value: `₹${commission.toLocaleString()}`, pct: Math.round((commission / totalRev) * 100), color: 'var(--success)' },
        ]);
      });

      return () => { ordersUnsub(); };
    });

    // Real-time activity log
    const actQ = query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc'), limit(10));
    const actUnsub = onSnapshot(actQ, snap => {
      setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    return () => {
      usersUnsub(); predsUnsub(); adsUnsub(); subsUnsub(); actUnsub();
    };
  }, []);

  const formatTime = (ts) => {
    if (!ts?.seconds) return 'Just now';
    const diff = Math.floor((Date.now() / 1000) - ts.seconds);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const statCards = [
    { icon: '👥', value: stats.totalUsers, label: 'Total Users', change: 'All registered users', up: true, bg: 'var(--accent-glow)' },
    { icon: '🏭', value: stats.manufacturers, label: 'Manufacturers', change: 'Active on platform', bg: 'rgba(59,130,246,0.1)' },
    { icon: '💰', value: `₹${(stats.monthlyRevenue + stats.salesCommission).toLocaleString('en-IN')}`, label: 'Monthly Revenue', change: 'This month (Subs + Comm)', up: true, bg: 'rgba(16,185,129,0.1)' },
    { icon: '🤖', value: stats.predictions.toLocaleString(), label: 'Total Predictions', change: 'All time', up: true, bg: 'rgba(168,85,247,0.1)' },
    { icon: '🏷️', value: stats.activeBrandAds, label: 'Active Brand Ads', change: 'Approved ads', bg: 'rgba(245,158,11,0.1)' },
    { icon: '⭐', value: '4.7', label: 'Platform Rating', change: 'Community feedback', bg: 'rgba(16,185,129,0.1)' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Admin Control Center" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">🛡️ Admin Dashboard</h1>
            <p className="page-subtitle">Full platform overview — users, models, revenue, and system health</p>
          </div>

          {loading ? <SkeletonStatsGrid count={6} /> : (
            <div className="stats-grid">
              {statCards.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className={`stat-change ${s.up ? 'up' : ''}`}>{s.change}</div>
                </div>
              ))}
            </div>
          )}

          {/* Revenue */}
          <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
            <Card title="💰 Revenue Breakdown" subtitle="This month's revenue sources">
              {revenueBreakdown.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 24 }}>
                  No subscription revenue this month yet.
                </div>
              ) : revenueBreakdown.map(r => (
                <div key={r.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontSize: '0.875rem', color: r.color, fontWeight: 700 }}>{r.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </Card>

            {/* Quick Nav */}
            <Card title="⚡ Quick Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '👥', label: 'Manage Users', sub: 'View, block, manage subscriptions', path: '/admin/users' },
                  { icon: '🤖', label: 'ML Model Monitor', sub: 'Track accuracy and retraining', path: '/admin/models' },
                  { icon: '📈', label: 'System Analytics', sub: 'Full platform performance', path: '/admin/analytics' },
                  { icon: '🏷️', label: 'Brand Ads Manager', sub: 'Approve and manage brand ads', path: '/admin/ads' },
                  { icon: '📩', label: 'Contact Submissions', sub: 'View user messages', path: '/admin/contact' },
                ].map(q => (
                  <div key={q.label}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, cursor: 'pointer', transition: 'var(--transition)' }}
                    onClick={() => navigate(q.path)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    <div style={{ fontSize: 24 }}>{q.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{q.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.sub}</div>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>→</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
             {/* Brand-wise Product Sales */}
             <Card title="📊 Brand-wise Sales Performance" subtitle="Top 5 ranking brand totals across all orders">
               {brandSales.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No sales recorded yet.</div>
               ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     {brandSales.map((b, idx) => (
                        <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                           <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>#{idx + 1}</div>
                              <div style={{ fontWeight: 600 }}>{b.name}</div>
                           </div>
                           <div style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{b.total.toLocaleString('en-IN')}</div>
                        </div>
                     ))}
                  </div>
               )}
             </Card>

            {/* Activity Feed */}
            <Card title="🔔 Recent Activity" subtitle="Latest platform events (real-time)">
              {activity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No activity logged yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {activity.map((a) => (
                    <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.role === 'admin' ? 'var(--danger)' : a.role === 'manufacturer' ? 'var(--info)' : 'var(--success)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.875rem' }}>{a.action} — </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>{a.userName || a.details}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(a.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;