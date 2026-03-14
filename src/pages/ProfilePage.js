// src/pages/ProfilePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, userProfile, updateProfile, changePassword } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = useState('profile');
    const [form, setForm] = useState({ name: userProfile?.name || '', email: userProfile?.email || '' });
    const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [error, setError] = useState('');
    const [pwError, setPwError] = useState('');

    const initials = userProfile?.name
        ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

    const dashPath = {
        user: '/user/dashboard', manufacturer: '/manufacturer/dashboard',
        brand: '/brand/dashboard', admin: '/admin/dashboard'
    }[userProfile?.role] || '/';

    const formatDate = (ts) => {
        if (!ts?.seconds) return ts || '-';
        return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleSaveProfile = async () => {
        if (!form.name) { setError('Name is required.'); return; }
        setSaving(true); setError('');
        try {
            await updateProfile(user.uid, { name: form.name });
            showToast('Profile updated successfully!', 'success');
        } catch {
            setError('Failed to update profile.');
            showToast('Failed to update profile', 'error');
        } finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (!pwForm.newPassword) { setPwError('Enter a new password.'); return; }
        if (pwForm.newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
        if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match.'); return; }
        setPwSaving(true); setPwError('');
        try {
            await changePassword(pwForm.newPassword);
            showToast('Password changed successfully!', 'success');
            setPwForm({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPwError('Failed to change password. Re-login and try again.');
            showToast('Failed to change password', 'error');
        } finally { setPwSaving(false); }
    };

    const planColors = { free: '#94A3B8', premium: '#F59E0B', pro: '#10B981' };
    const plan = userProfile?.subscription || 'free';

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Navbar title="My Profile" />
                <div className="page-content">
                    <div className="page-header">
                        <h1 className="page-title">👤 My Profile</h1>
                        <p className="page-subtitle">Manage your account information and security settings</p>
                    </div>

                    <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
                        {/* Left: Profile Card */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32, textAlign: 'center' }}>
                                <div style={{
                                    width: 88, height: 88, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '2rem', color: '#000',
                                    margin: '0 auto 16px'
                                }}>
                                    {initials}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>{userProfile?.name}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{userProfile?.email}</div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{userProfile?.role}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: planColors[plan], background: `${planColors[plan]}20`, border: `1px solid ${planColors[plan]}40`, borderRadius: 999, padding: '3px 10px' }}>
                                        ⭐ {plan.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <Card title="Account Info">
                                {[
                                    ['Account ID', user?.uid?.slice(0, 12) + '...'],
                                    ['Role', userProfile?.role],
                                    ['Plan', plan.toUpperCase()],
                                    ['Member Since', formatDate(userProfile?.createdAt)],
                                    ['Last Login', formatDate(userProfile?.lastLogin)],
                                    ['Status', userProfile?.status || 'active'],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>
                                    </div>
                                ))}
                                {plan !== 'pro' && (
                                    <button className="btn btn-primary btn-full btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/pricing')}>
                                        ⚡ Upgrade Plan
                                    </button>
                                )}
                            </Card>

                            <button className="btn btn-secondary" onClick={() => navigate(dashPath)}>
                                ← Back to Dashboard
                            </button>
                        </div>

                        {/* Right: Tabs */}
                        <div>
                            <div className="tabs" style={{ marginBottom: 20 }}>
                                <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>📋 Profile</button>
                                <button className={`tab-btn ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>🔐 Security</button>
                            </div>

                            {tab === 'profile' && (
                                <Card title="Edit Profile" subtitle="Update your display name and account details">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input className="form-control" value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Email cannot be changed.</div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Role</label>
                                        <input className="form-control" value={userProfile?.role} disabled style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }} />
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Contact admin to change your role.</div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subscription Plan</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: planColors[plan] }}>{plan.toUpperCase()}</span>
                                            {plan !== 'pro' && (
                                                <button className="btn btn-primary btn-sm" onClick={() => navigate('/pricing')}>
                                                    Upgrade →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <button className="btn btn-primary btn-lg" onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? '⏳ Saving...' : '💾 Save Changes'}
                                    </button>
                                </Card>
                            )}

                            {tab === 'security' && (
                                <Card title="Change Password" subtitle="Update your account password">
                                    {pwError && <div className="alert alert-danger">{pwError}</div>}
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input
                                            className="form-control" type="password" placeholder="Min 6 characters"
                                            value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            className="form-control" type="password" placeholder="Re-enter new password"
                                            value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, marginBottom: 20, fontSize: '0.82rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                        🔐 <strong style={{ color: 'var(--text-primary)' }}>Security note:</strong> You may need to re-login after changing your password if your session was created more than an hour ago.
                                    </div>
                                    <button className="btn btn-primary btn-lg" onClick={handleChangePassword} disabled={pwSaving}>
                                        {pwSaving ? '⏳ Changing...' : '🔐 Change Password'}
                                    </button>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
