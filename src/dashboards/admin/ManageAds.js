// src/dashboards/admin/ManageAds.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/common/Toast';

const ManageAds = () => {
    const { showToast } = useToast();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'brand_ads'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    const filtered = ads.filter(a => filter === 'all' || a.status === filter);

    const updateStatus = async (id, status) => {
        try {
            await updateDoc(doc(db, 'brand_ads', id), { status });
            showToast(`Ad ${status === 'approved' ? 'approved' : 'rejected'}`, status === 'approved' ? 'success' : 'warning');
        } catch { showToast('Failed to update ad status', 'error'); }
    };

    const deleteAd = async (id) => {
        if (!window.confirm('Delete this ad permanently?')) return;
        try {
            await deleteDoc(doc(db, 'brand_ads', id));
            showToast('Ad deleted', 'info');
            if (selected?.id === id) setSelected(null);
        } catch { showToast('Failed to delete ad', 'error'); }
    };

    const statusColors = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };

    const formatDate = (ts) => {
        if (!ts?.seconds) return '-';
        return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const totalImpressions = ads.reduce((sum, a) => sum + (a.impressionCount || 0), 0);
    const totalClicks = ads.reduce((sum, a) => sum + (a.clickCount || 0), 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Navbar title="Brand Ads Manager" />
                <div className="page-content">
                    <div className="page-header">
                        <h1 className="page-title">🏷️ Brand Ads Manager</h1>
                        <p className="page-subtitle">Review, approve, and track all brand advertisement submissions</p>
                    </div>

                    <div className="stats-grid">
                        {[
                            { icon: '📢', value: ads.length, label: 'Total Ads', bg: 'var(--accent-glow)' },
                            { icon: '⏳', value: ads.filter(a => a.status === 'pending').length, label: 'Pending Review', bg: 'rgba(245,158,11,0.1)' },
                            { icon: '✅', value: ads.filter(a => a.status === 'approved').length, label: 'Approved', bg: 'rgba(16,185,129,0.1)' },
                            { icon: '📊', value: `${avgCTR}%`, label: 'Avg CTR', bg: 'rgba(168,85,247,0.1)' },
                        ].map(s => (
                            <div key={s.label} className="stat-card">
                                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filter tabs */}
                    <div className="tabs" style={{ marginBottom: 20 }}>
                        {['all', 'pending', 'approved', 'rejected'].map(f => (
                            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading ads...</div>
                        ) : filtered.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-state-icon">📢</span>
                                <div className="empty-state-text">No {filter === 'all' ? '' : filter} ads found.</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {filtered.map(ad => (
                                    <div
                                        key={ad.id}
                                        style={{
                                            background: selected?.id === ad.id ? 'rgba(245,158,11,0.05)' : 'var(--bg-card)',
                                            border: `1px solid ${selected?.id === ad.id ? 'var(--accent)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius)', padding: 20, transition: 'var(--transition)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                            {ad.imageUrl && (
                                                <div style={{ width: 80, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)' }}>
                                                    <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ad.title}</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>{ad.brandName}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                        <span className={`badge ${statusColors[ad.status] || 'badge-default'}`}>{ad.status}</span>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                                                    {ad.description?.slice(0, 120)}...
                                                </div>
                                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👁 {ad.impressionCount || 0} impressions</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🖱 {ad.clickCount || 0} clicks</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {formatDate(ad.createdAt)}</span>
                                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                                        {ad.status === 'pending' && (
                                                            <>
                                                                <button className="btn btn-success btn-sm" onClick={() => updateStatus(ad.id, 'approved')}>✅ Approve</button>
                                                                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(ad.id, 'rejected')}>❌ Reject</button>
                                                            </>
                                                        )}
                                                        {ad.status === 'approved' && (
                                                            <button className="btn btn-warning btn-sm" onClick={() => updateStatus(ad.id, 'pending')}>⏸ Pause</button>
                                                        )}
                                                        {ad.status === 'rejected' && (
                                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(ad.id, 'approved')}>✅ Re-approve</button>
                                                        )}
                                                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(selected?.id === ad.id ? null : ad)}>Details</button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => deleteAd(ad.id)}>🗑</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Ad Detail Panel */}
                        {selected && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, alignSelf: 'start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div style={{ fontWeight: 700 }}>Ad Details</div>
                                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
                                </div>
                                {selected.imageUrl && (
                                    <div style={{ height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 16, background: 'var(--bg-elevated)' }}>
                                        <img src={selected.imageUrl} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                    </div>
                                )}
                                {[
                                    ['Brand', selected.brandName],
                                    ['Title', selected.title],
                                    ['CTA Text', selected.ctaText],
                                    ['CTA URL', selected.ctaUrl],
                                    ['Target Colors', selected.targetColor?.join(', ')],
                                    ['Status', selected.status],
                                    ['Impressions', selected.impressionCount || 0],
                                    ['Clicks', selected.clickCount || 0],
                                    ['Submitted', formatDate(selected.createdAt)],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                                        <span style={{ fontWeight: 600, maxWidth: 140, textAlign: 'right', wordBreak: 'break-all' }}>{v || '-'}</span>
                                    </div>
                                ))}
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
                                    {selected.description}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAds;
