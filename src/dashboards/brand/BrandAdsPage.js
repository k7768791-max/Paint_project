// src/dashboards/brand/BrandAdsPage.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import {
    collection, query, where, onSnapshot,
    addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/common/Toast';

const EMPTY_FORM = {
    title: '', description: '', ctaText: 'Learn More', ctaUrl: '',
    imageUrl: '', targetColor: [], targetSurface: [],
};

const COLOR_OPTIONS = ['White', 'Grey', 'Beige', 'Navy', 'Terracotta', 'Olive Green', 'Sage', 'Charcoal'];
const SURFACE_OPTIONS = ['Wall', 'Wood', 'Iron', 'Plastic', 'Concrete'];

const BrandAdsPage = () => {
    const { user, userProfile } = useAuth();
    const { showToast } = useToast();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.uid) return;
        const q = query(collection(db, 'brand_ads'), where('brandUid', '==', user.uid));
        const unsub = onSnapshot(q, snap => {
            setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [user?.uid]);

    const toggleTarget = (field, val) => {
        const arr = form[field];
        setForm({ ...form, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.ctaUrl) {
            setError('Title, description, and CTA URL are required.'); return;
        }
        setSubmitting(true); setError('');
        try {
            await addDoc(collection(db, 'brand_ads'), {
                ...form,
                brandUid: user.uid,
                brandName: userProfile?.name || userProfile?.email,
                status: 'pending',
                impressionCount: 0,
                clickCount: 0,
                createdAt: serverTimestamp()
            });
            // Notify admin via activity log
            await addDoc(collection(db, 'activity_logs'), {
                uid: user.uid, userName: userProfile?.name || 'Brand',
                role: 'brand',
                action: 'New ad submitted for review',
                details: `"${form.title}" by ${userProfile?.name || 'Brand'}`,
                createdAt: serverTimestamp()
            });
            showToast('Ad submitted for admin review!', 'success');
            setForm(EMPTY_FORM);
            setShowForm(false);
        } catch (err) {
            setError('Failed to submit ad. Please try again.');
            showToast('Failed to submit ad', 'error');
        } finally { setSubmitting(false); }
    };

    const statusColors = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };

    const formatDate = (ts) => {
        if (!ts?.seconds) return '-';
        return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const totalImpressions = ads.reduce((sum, a) => sum + (a.impressionCount || 0), 0);
    const totalClicks = ads.reduce((sum, a) => sum + (a.clickCount || 0), 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Navbar title="Manage Ads" />
                <div className="page-content">
                    <div className="page-header">
                        <h1 className="page-title">📢 Ad Campaign Manager</h1>
                        <p className="page-subtitle">Submit targeted ads to reach ChromaAI users at the point of recommendation</p>
                    </div>

                    <div className="stats-grid" style={{ marginBottom: 24 }}>
                        {[
                            { icon: '📢', value: ads.length, label: 'Total Ads', bg: 'var(--accent-glow)' },
                            { icon: '✅', value: ads.filter(a => a.status === 'approved').length, label: 'Active', bg: 'rgba(16,185,129,0.1)' },
                            { icon: '👁️', value: totalImpressions.toLocaleString(), label: 'Total Impressions', bg: 'rgba(59,130,246,0.1)' },
                            { icon: '📊', value: `${avgCTR}%`, label: 'Avg CTR', bg: 'rgba(168,85,247,0.1)' },
                        ].map(s => (
                            <div key={s.label} className="stat-card">
                                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Ad Button */}
                    <div style={{ marginBottom: 20 }}>
                        {userProfile?.subscription === 'free' ? (
                            <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>🔒 <strong>Premium Feature.</strong> Upgrade your plan to submit sponsored ads on ChromaAI.</span>
                                <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/pricing'}>Upgrade Now</button>
                            </div>
                        ) : (
                            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                                {showForm ? '× Cancel' : '+ Submit New Ad'}
                            </button>
                        )}
                    </div>

                    {/* Submission Form */}
                    {showForm && (
                        <Card title="📋 New Ad Submission" subtitle="Fill in your ad details. Ads go live after admin approval.">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Ad Title *</label>
                                        <input className="form-control" placeholder="e.g. New Premium Exterior Range" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CTA Button Text</label>
                                        <input className="form-control" placeholder="e.g. Shop Now" value={form.ctaText} onChange={e => setForm({ ...form, ctaText: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea className="form-control" rows={3} placeholder="Ad description visible to users..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">CTA URL *</label>
                                        <input className="form-control" type="url" placeholder="https://yoursite.com/product" value={form.ctaUrl} onChange={e => setForm({ ...form, ctaUrl: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ad Image URL</label>
                                        <input className="form-control" type="url" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Colors (optional — shown on these recommendations)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {COLOR_OPTIONS.map(c => (
                                            <button key={c} type="button"
                                                className={`btn btn-sm ${form.targetColor.includes(c) ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => toggleTarget('targetColor', c)}
                                            >{c}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Surfaces (optional)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {SURFACE_OPTIONS.map(s => (
                                            <button key={s} type="button"
                                                className={`btn btn-sm ${form.targetSurface.includes(s) ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => toggleTarget('targetSurface', s)}
                                            >{s}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? '⏳ Submitting...' : '📤 Submit for Review'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Ad List */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading...</div>
                    ) : ads.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">📢</span>
                            <div className="empty-state-text">No ads yet. Submit your first ad campaign to reach ChromaAI users!</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {ads.map(ad => (
                                <div key={ad.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                        {ad.imageUrl && (
                                            <div style={{ width: 80, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)' }}>
                                                <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <div style={{ fontWeight: 700 }}>{ad.title}</div>
                                                <span className={`badge ${statusColors[ad.status]}`}>{ad.status}</span>
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{ad.description?.slice(0, 100)}...</div>
                                            <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                <span>👁 {ad.impressionCount || 0}</span>
                                                <span>🖱 {ad.clickCount || 0}</span>
                                                <span>
                                                    CTR: {ad.impressionCount ? ((ad.clickCount || 0) / ad.impressionCount * 100).toFixed(1) : 0}%
                                                </span>
                                                <span>📅 {formatDate(ad.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {ad.status === 'rejected' && (
                                        <div className="alert alert-danger" style={{ marginTop: 12, fontSize: '0.82rem' }}>
                                            ❌ This ad was rejected by the admin. Please submit a revised version.
                                        </div>
                                    )}
                                    {ad.status === 'pending' && (
                                        <div className="alert alert-warning" style={{ marginTop: 12, fontSize: '0.82rem' }}>
                                            ⏳ Under review. You'll be notified when admin approves your ad.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandAdsPage;
