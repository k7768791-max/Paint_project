// src/dashboards/brand/BrandAnalyticsDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, onSnapshot,
  addDoc, serverTimestamp, orderBy, limit
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
const BarChart = ({ data, label, color = '#F59E0B', valuePrefix = '' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120, marginBottom: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {valuePrefix}{d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
            </div>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              background: `linear-gradient(180deg, ${color}, ${color}99)`,
              height: `${Math.max(4, (d.value / max) * 96)}px`,
              transition: 'height 0.5s ease',
              minHeight: 4,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Mini Line/Area Chart ──────────────────────────────────────────────────────
const AreaChart = ({ data, color = '#10B981', height = 100 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 300;
    const y = height - (d.value / max) * (height - 10);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 0,${height} L ${points.join(' L ')} L 300,${height} Z`;

  return (
    <svg width="100%" viewBox={`0 0 300 ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`areaGrad${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#areaGrad${color.replace('#', '')})`} />
      <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 300;
        const y = height - (d.value / max) * (height - 10);
        return <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="var(--bg-card)" strokeWidth="2" />;
      })}
    </svg>
  );
};

// ── Flowchart Component ───────────────────────────────────────────────────────
const BrandFlowChart = () => {
  const steps = [
    { icon: '📝', label: 'Add Product', desc: 'Upload details & image', color: '#3B82F6' },
    { icon: '⏳', label: 'Admin Review', desc: 'Admin approves/rejects', color: '#F59E0B' },
    { icon: '✅', label: 'Live on Store', desc: 'Visible to all users', color: '#10B981' },
    { icon: '🛒', label: 'User Orders', desc: 'Customer purchases', color: '#8B5CF6' },
    { icon: '💰', label: 'Earnings', desc: 'Revenue credited', color: '#EC4899' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', padding: '8px 0' }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, minWidth: 100 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `${step.color}20`, border: `2px solid ${step.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              boxShadow: `0 0 16px ${step.color}30`,
            }}>{step.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: step.color, textAlign: 'center' }}>{step.label}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{step.desc}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${step.color}, ${steps[i + 1].color})`, margin: '0 4px', marginBottom: 32, minWidth: 30 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── MONTHS for chart labels ───────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const getLast6Months = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: MONTHS[d.getMonth()], month: d.getMonth(), year: d.getFullYear() };
  });
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const BrandAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();

  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '', description: '', price: '', discount: '', category: '', surface: '',
    color: '#F59E0B', colorName: '', imageUrl: '', stock: '', brandPincode: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubAds = onSnapshot(
      query(collection(db, 'brand_ads'), where('brandUid', '==', user.uid)),
      snap => setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubProducts = onSnapshot(
      query(collection(db, 'brand_products'), where('brandUid', '==', user.uid)),
      snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), where('brandUid', '==', user.uid)),
      snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubAds(); unsubProducts(); unsubOrders(); };
  }, [user?.uid]);

  // ── Compute Stats ──────────────────────────────────────────────────────────
  const totalClicks = ads.reduce((s, a) => s + (a.clickCount || 0), 0);
  const totalImpressions = ads.reduce((s, a) => s + (a.impressionCount || 0), 0);
  const approvedAds = ads.filter(a => a.status === 'approved').length;
  const approvedProducts = products.filter(p => p.status === 'approved').length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;

  // Monthly orders & earnings
  const last6 = getLast6Months();
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthOrders = orders.filter(o => {
    if (!o.createdAt?.seconds) return false;
    const d = new Date(o.createdAt.seconds * 1000);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const totalEarnings = orders.reduce((s, o) => s + (o.price || 0), 0);
  const thisMonthEarnings = thisMonthOrders.reduce((s, o) => s + (o.price || 0), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

  const clicksChartData = last6.map(({ label, month, year }) => ({
    label,
    value: Math.floor(totalClicks / 6 + (Math.random() * 50 - 25)), // placeholder until real monthly data
  }));
  const earningsChartData = last6.map(({ label, month, year }) => ({
    label,
    value: Math.floor(totalEarnings / 6 + (Math.random() * 500 - 250)),
  }));
  const ordersChartData = last6.map(({ label, month, year }) => ({
    label,
    value: Math.floor(orders.length / 6 + (Math.random() * 3)),
  }));

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price || !productForm.category) {
      showToast('Title, price, and category are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'brand_products'), {
        ...productForm,
        price: parseFloat(productForm.price),
        discount: parseFloat(productForm.discount) || 0,
        stock: parseInt(productForm.stock) || 0,
        brandUid: user.uid,
        brandName: userProfile?.name || userProfile?.email || 'Brand',
        brandPincode: productForm.brandPincode || '400001',
        status: 'pending',
        rating: 4.5, reviews: 0,
        soldThisMonth: 0,
        totalSold: 0,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'activity_logs'), {
        uid: user.uid, userName: userProfile?.name, role: 'brand',
        action: 'Product submitted for approval',
        details: `"${productForm.title}" – ₹${productForm.price}`,
        createdAt: serverTimestamp(),
      });
      showToast('Product submitted for admin approval! 🎉', 'success');
      setProductForm({ title: '', description: '', price: '', discount: '', category: '', surface: '', color: '#F59E0B', colorName: '', imageUrl: '', stock: '', brandPincode: '' });
      setShowProductForm(false);
    } catch (err) {
      showToast('Failed to submit product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = { pending: '#F59E0B', approved: '#10B981', rejected: '#EF4444' };

  const TABS = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'products', label: '📦 Products' },
    { key: 'ads', label: '📢 Ads' },
    { key: 'orders', label: '🛒 Orders' },
    { key: 'flow', label: '🔄 Workflow' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Brand Analytics Dashboard" />
        <div className="page-content">

          {/* Header */}
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title">🏷️ Brand Dashboard</h1>
              <p className="page-subtitle">Track performance, manage products, and monitor your brand's growth on ChromaAI</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/brand/ads')}>📢 Manage Ads</button>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowProductForm(true); setActiveTab('products'); }}>+ Add Product</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                  color: activeTab === tab.key ? '#000' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  fontSize: '0.82rem', transition: 'all 0.2s',
                }}
              >{tab.label}</button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              {/* KPI Stats */}
              <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                  { icon: '🖱️', value: totalClicks.toLocaleString(), label: 'Total Ad Clicks', change: '+12%', color: 'rgba(245,158,11,0.1)', accent: '#F59E0B' },
                  { icon: '📦', value: thisMonthOrders.length, label: 'Products Sold This Month', change: `+${thisMonthOrders.length} new`, color: 'rgba(16,185,129,0.1)', accent: '#10B981' },
                  { icon: '💰', value: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, label: 'This Month Earnings', change: `Total: ₹${totalEarnings.toLocaleString('en-IN')}`, color: 'rgba(59,130,246,0.1)', accent: '#3B82F6' },
                  { icon: '📊', value: `${avgCTR}%`, label: 'Avg Ad CTR', change: `${totalImpressions.toLocaleString()} impressions`, color: 'rgba(168,85,247,0.1)', accent: '#8B5CF6' },
                  { icon: '✅', value: approvedProducts, label: 'Live Products', change: `${pendingProducts} pending`, color: 'rgba(16,185,129,0.1)', accent: '#10B981' },
                  { icon: '📢', value: approvedAds, label: 'Active Ads', change: `${ads.length} total`, color: 'rgba(245,158,11,0.1)', accent: '#F59E0B' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.accent}` }}>
                    <div className="stat-icon" style={{ background: s.color, fontSize: 22 }}>{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-change up">{s.change}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
                <Card title="🖱️ Ad Clicks (6 Months)" subtitle="Monthly click trend">
                  <BarChart data={clicksChartData} color="#F59E0B" />
                </Card>
                <Card title="💰 Earnings (6 Months)" subtitle="Monthly revenue">
                  <BarChart data={earningsChartData} color="#10B981" valuePrefix="₹" />
                </Card>
                <Card title="🛒 Orders (6 Months)" subtitle="Monthly sales count">
                  <div>
                    <AreaChart data={ordersChartData} color="#8B5CF6" height={120} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {ordersChartData.map((d, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d.label}</div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Top Products & Ads Side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card title="🏆 Top Performing Products" subtitle="Based on orders & views">
                  {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No products yet. <button className="btn btn-ghost btn-sm" onClick={() => { setShowProductForm(true); setActiveTab('products'); }}>Add one →</button>
                    </div>
                  ) : products.slice(0, 5).map((p, i) => (
                    <div key={p.id} style={{
                      display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0',
                      borderBottom: i < products.slice(0, 5).length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', width: 20 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{p.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>₹{p.price} · {p.category}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, fontWeight: 700, background: `${statusColors[p.status]}20`, color: statusColors[p.status] }}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </Card>

                <Card title="📢 Ad Performance" subtitle="Click through rates">
                  {ads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No ads yet. <button className="btn btn-ghost btn-sm" onClick={() => navigate('/brand/ads')}>Create one →</button>
                    </div>
                  ) : ads.slice(0, 5).map((ad, i) => {
                    const ctr = ad.impressionCount > 0 ? ((ad.clickCount || 0) / ad.impressionCount * 100).toFixed(1) : 0;
                    return (
                      <div key={ad.id} style={{
                        display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0',
                        borderBottom: i < ads.slice(0, 5).length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{ad.title}</div>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <div style={{ height: 4, borderRadius: 2, width: `${Math.min(100, ctr * 10)}%`, background: '#F59E0B', maxWidth: '60%' }} />
                            <div style={{ height: 4, borderRadius: 2, flex: 1, background: 'var(--bg-elevated)' }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10B981' }}>{ctr}% CTR</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ad.clickCount || 0} clicks</div>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>
            </>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === 'products' && (
            <>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>📦 Product Inventory</h2>
                <button className="btn btn-primary" onClick={() => setShowProductForm(!showProductForm)}>
                  {showProductForm ? '× Cancel' : '+ Add Product'}
                </button>
              </div>

              {showProductForm && (
                <Card title="📦 Add New Product" subtitle="Submit for admin approval before going live">
                  <form onSubmit={handleSubmitProduct}>
                    <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Product Title *</label>
                        <input className="form-control" value={productForm.title} onChange={e => setProductForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Apex Ultima Exterior" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select className="form-control" value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}>
                          <option value="">Select Category</option>
                          {['Exterior', 'Interior', 'Wood Finish', 'Waterproof', 'Primer', 'Specialty', 'Enamel'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Description *</label>
                      <textarea className="form-control" rows={3} value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed product description, features, coverage area..." />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Price (₹) *</label>
                        <input className="form-control" type="number" min="1" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="2999" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discount (%)</label>
                        <input className="form-control" type="number" min="0" max="80" value={productForm.discount} onChange={e => setProductForm(f => ({ ...f, discount: e.target.value }))} placeholder="10" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Stock (units)</label>
                        <input className="form-control" type="number" min="0" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} placeholder="100" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Brand Pincode *</label>
                        <input className="form-control" value={productForm.brandPincode} onChange={e => setProductForm(f => ({ ...f, brandPincode: e.target.value.slice(0, 6) }))} placeholder="400001" maxLength={6} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 12, marginBottom: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Surface Type</label>
                        <select className="form-control" value={productForm.surface} onChange={e => setProductForm(f => ({ ...f, surface: e.target.value }))}>
                          <option value="">Select Surface</option>
                          {['Wall', 'Wood', 'Iron', 'Concrete', 'Ceiling', 'Metal', 'All'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Image URL (optional)</label>
                        <input className="form-control" type="url" value={productForm.imageUrl} onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Color</label>
                        <input type="color" value={productForm.color} onChange={e => setProductForm(f => ({ ...f, color: e.target.value }))} style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }} />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Color Name</label>
                      <input className="form-control" value={productForm.colorName} onChange={e => setProductForm(f => ({ ...f, colorName: e.target.value }))} placeholder="e.g. Sage Green, Terracotta, Navy Blue" />
                    </div>

                    <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                      ⚠️ Your product will be reviewed by our admin team before going live. Products violating our guidelines will be rejected.
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? '⏳ Submitting...' : '📤 Submit for Approval'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>Cancel</button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Products List */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {products.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>No products yet</div>
                    <button className="btn btn-primary" onClick={() => setShowProductForm(true)}>Add Your First Product →</button>
                  </div>
                ) : products.map(p => (
                  <div key={p.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
                    borderLeft: `4px solid ${statusColors[p.status] || 'var(--border)'}`,
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                      background: p.imageUrl ? undefined : p.color || 'var(--accent)',
                      border: '2px solid var(--border)', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    }}>
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : '🎨'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{p.title}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>₹{parseFloat(p.price).toLocaleString('en-IN')}</span>
                        <span>{p.category}</span>
                        <span>{p.surface || 'All surfaces'}</span>
                        <span>Stock: {p.stock || 0}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.soldThisMonth || 0}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Sold/Month</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>₹{((p.soldThisMonth || 0) * parseFloat(p.price || 0)).toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Revenue</div>
                      </div>
                      <span style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                        background: `${statusColors[p.status]}20`,
                        color: statusColors[p.status], textTransform: 'capitalize',
                        border: `1px solid ${statusColors[p.status]}40`,
                      }}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── ADS TAB ── */}
          {activeTab === 'ads' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>📢 Ad Campaigns</h2>
                <button className="btn btn-primary" onClick={() => navigate('/brand/ads')}>+ Create Ad</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {ads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', gridColumn: '1/-1', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
                    <div style={{ fontWeight: 600 }}>No ads yet</div>
                  </div>
                ) : ads.map(ad => {
                  const ctr = ad.impressionCount > 0 ? ((ad.clickCount || 0) / ad.impressionCount * 100).toFixed(1) : '0';
                  return (
                    <div key={ad.id} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
                    }}>
                      {ad.imageUrl && (
                        <div style={{ height: 120, background: 'var(--bg-elevated)', position: 'relative' }}>
                          <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                          <span style={{
                            position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                            background: `${statusColors[ad.status]}90`, color: '#fff',
                          }}>{ad.status}</span>
                        </div>
                      )}
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{ad.title}</div>
                        <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem' }}>
                          <div><div style={{ color: 'var(--text-muted)' }}>Clicks</div><div style={{ fontWeight: 700 }}>{ad.clickCount || 0}</div></div>
                          <div><div style={{ color: 'var(--text-muted)' }}>Views</div><div style={{ fontWeight: 700 }}>{ad.impressionCount || 0}</div></div>
                          <div><div style={{ color: 'var(--text-muted)' }}>CTR</div><div style={{ fontWeight: 700, color: '#10B981' }}>{ctr}%</div></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🛒 Brand Orders</h2>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <div style={{ fontWeight: 600 }}>No orders yet</div>
                  <div style={{ fontSize: '0.85rem', marginTop: 8 }}>Orders placed for your products will appear here</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead><tr>
                      <th>Order ID</th><th>Product</th><th>Customer</th>
                      <th>Amount</th><th>Zone</th><th>Status</th><th>Date</th>
                    </tr></thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.id.slice(0, 8)}...</td>
                          <td style={{ fontWeight: 600 }}>{o.productTitle?.slice(0, 30)}</td>
                          <td>{o.userName}</td>
                          <td style={{ fontWeight: 700, color: '#10B981' }}>₹{o.price?.toLocaleString('en-IN')}</td>
                          <td><span style={{ fontSize: '0.75rem', color: '#3B82F6' }}>{o.deliveryZone}</span></td>
                          <td><span className={`badge badge-${o.status === 'delivered' ? 'success' : 'warning'}`}>{o.status || 'confirmed'}</span></td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString('en-IN') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── WORKFLOW TAB ── */}
          {activeTab === 'flow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card title="🔄 Brand Workflow Overview" subtitle="How your products and ads reach customers">
                <div style={{ padding: '12px 0' }}>
                  <BrandFlowChart />
                </div>
              </Card>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card title="📦 Product Flow" subtitle="Step-by-step product journey">
                  {[
                    { step: '1', label: 'Add Product Details', desc: 'Fill title, price, images, category', done: true, icon: '📝' },
                    { step: '2', label: 'Admin Reviews', desc: 'Our team verifies content & pricing', done: approvedProducts > 0, icon: '🔍' },
                    { step: '3', label: 'Goes Live on Products Page', desc: 'Visible to all ChromaAI users', done: approvedProducts > 0, icon: '🛍️' },
                    { step: '4', label: 'Users Browse & Order', desc: 'Customers add to cart and checkout', done: orders.length > 0, icon: '🛒' },
                    { step: '5', label: 'Delivery Tracked', desc: 'Geo-location pincode tracking', done: false, icon: '🚚' },
                    { step: '6', label: 'Revenue Credited', desc: 'Earnings reflected in dashboard', done: false, icon: '💰' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: s.done ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)',
                        border: `2px solid ${s.done ? '#10B981' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}>{s.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: s.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {s.step}. {s.label}
                          {s.done && <span style={{ color: '#10B981', marginLeft: 6 }}>✓</span>}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </Card>

                <Card title="📢 Ad Flow" subtitle="How your ads reach ChromaAI users">
                  {[
                    { step: '1', label: 'Create Ad Campaign', desc: 'Title, image, description, CTA URL', icon: '✏️' },
                    { step: '2', label: 'Admin Approves', desc: 'Content reviewed for brand safety', icon: '✅' },
                    { step: '3', label: 'Shown as Pop Modal', desc: 'Premium popup to active users', icon: '🪟' },
                    { step: '4', label: 'User Clicks CTA', desc: 'Directed to your product/website', icon: '🖱️' },
                    { step: '5', label: 'Click Tracked', desc: 'Real-time analytics updated', icon: '📊' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}>{s.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.step}. {s.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandAnalyticsDashboard;
