// src/dashboards/admin/ContactSubmissions.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/common/Toast';
import { SkeletonTable } from '../../components/common/Skeleton';

const ContactSubmissions = () => {
    const { showToast } = useToast();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'contact_submissions'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    const filtered = submissions.filter(s => {
        const matchStatus = filter === 'all' || s.status === filter;
        const matchSearch = !search ||
            (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.subject || '').toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const markRead = async (id) => {
        try {
            await updateDoc(doc(db, 'contact_submissions', id), { status: 'read' });
        } catch { }
    };

    const markResolved = async (id) => {
        try {
            await updateDoc(doc(db, 'contact_submissions', id), { status: 'resolved' });
            showToast('Marked as resolved', 'success');
        } catch { showToast('Failed to update', 'error'); }
    };

    const deleteSubmission = async (id) => {
        if (!window.confirm('Delete this submission?')) return;
        try {
            await deleteDoc(doc(db, 'contact_submissions', id));
            showToast('Submission deleted', 'info');
            if (selected?.id === id) setSelected(null);
        } catch { showToast('Failed to delete', 'error'); }
    };

    const openSubmission = (s) => {
        setSelected(s);
        if (s.status === 'unread') markRead(s.id);
    };

    const formatDate = (ts) => {
        if (!ts?.seconds) return '-';
        return new Date(ts.seconds * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const statusColors = { unread: 'badge-warning', read: 'badge-info', resolved: 'badge-success' };
    const unreadCount = submissions.filter(s => s.status === 'unread').length;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Navbar title="Contact Submissions" />
                <div className="page-content">
                    <div className="page-header">
                        <h1 className="page-title">📩 Contact Submissions</h1>
                        <p className="page-subtitle">View and manage messages from users and prospects</p>
                    </div>

                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                        {[
                            { icon: '📩', value: submissions.length, label: 'Total Messages', bg: 'var(--accent-glow)' },
                            { icon: '🔴', value: unreadCount, label: 'Unread', bg: 'rgba(239,68,68,0.1)' },
                            { icon: '✅', value: submissions.filter(s => s.status === 'resolved').length, label: 'Resolved', bg: 'rgba(16,185,129,0.1)' },
                            { icon: '📋', value: [...new Set(submissions.map(s => s.subject))].length, label: 'Subjects', bg: 'rgba(59,130,246,0.1)' },
                        ].map(s => (
                            <div key={s.label} className="stat-card">
                                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filter */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input className="form-control" style={{ width: 240 }} placeholder="🔍 Search by name, email, or subject..." value={search} onChange={e => setSearch(e.target.value)} />
                        <div className="tabs" style={{ margin: 0 }}>
                            {['all', 'unread', 'read', 'resolved'].map(f => (
                                <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
                                    {f}{f === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                                </button>
                            ))}
                        </div>
                        <span className="badge badge-info" style={{ padding: '6px 12px', marginLeft: 'auto' }}>{filtered.length} messages</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
                        {loading ? <SkeletonTable rows={5} /> : filtered.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-state-icon">📩</span>
                                <div className="empty-state-text">No submissions found.</div>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>From</th><th>Email</th><th>Subject</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filtered.map(s => (
                                            <tr key={s.id} style={{ cursor: 'pointer', background: s.status === 'unread' ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
                                                <td style={{ fontWeight: s.status === 'unread' ? 700 : 500 }} onClick={() => openSubmission(s)}>{s.name}</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }} onClick={() => openSubmission(s)}>{s.email}</td>
                                                <td onClick={() => openSubmission(s)}>{s.subject}</td>
                                                <td><span className={`badge ${statusColors[s.status] || 'badge-default'}`}>{s.status}</span></td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatDate(s.createdAt)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => openSubmission(s)}>View</button>
                                                        {s.status !== 'resolved' && (
                                                            <button className="btn btn-success btn-sm" onClick={() => markResolved(s.id)}>✓ Resolve</button>
                                                        )}
                                                        <button className="btn btn-danger btn-sm" onClick={() => deleteSubmission(s.id)}>🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Message Detail */}
                        {selected && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, alignSelf: 'start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div style={{ fontWeight: 700 }}>Message</div>
                                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
                                </div>
                                {[
                                    ['From', selected.name],
                                    ['Email', selected.email],
                                    ['Subject', selected.subject],
                                    ['Status', selected.status],
                                    ['Received', formatDate(selected.createdAt)],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                                        <span style={{ fontWeight: 600 }}>{v}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Message</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, border: '1px solid var(--border)' }}>
                                        {selected.message}
                                    </div>
                                </div>
                                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn btn-primary btn-sm btn-full">
                                        📧 Reply via Email
                                    </a>
                                    {selected.status !== 'resolved' && (
                                        <button className="btn btn-success btn-sm btn-full" onClick={() => markResolved(selected.id)}>
                                            ✅ Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSubmissions;
