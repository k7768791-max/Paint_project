// src/pages/Contact.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/common/Toast';

const PublicNav = () => {
    const navigate = useNavigate();
    const { user, userProfile, logout } = useAuth();
    const [avatarOpen, setAvatarOpen] = React.useState(false);
    const initials = userProfile?.name
        ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
    const dashPath = { user: '/user/dashboard', manufacturer: '/manufacturer/dashboard', brand: '/brand/dashboard', admin: '/admin/dashboard' }[userProfile?.role] || '/';
    return (
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, backdropFilter: 'blur(16px)', background: 'rgba(8,14,26,0.9)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
                <div className="brand-icon">🎨</div>
                <div className="brand-name">ChromaAI</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
                {[['Home', '/'], ['About', '/about'], ['Why Us', '/why-us'], ['Contact', '/contact']].map(([l, p]) => (
                    <button key={l} className="btn btn-ghost btn-sm" onClick={() => navigate(p)}>{l}</button>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {!user ? (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
                    </>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <div className="avatar" onClick={() => setAvatarOpen(!avatarOpen)} style={{ cursor: 'pointer', width: 40, height: 40 }}>{initials}</div>
                        {avatarOpen && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 180, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)', zIndex: 500, overflow: 'hidden' }}>
                                <button onClick={() => { navigate(dashPath); setAvatarOpen(false); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📊 Dashboard</button>
                                <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--danger)', borderTop: '1px solid var(--border)' }}>🚪 Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

const Contact = () => {
    const { showToast } = useToast();
    const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            setError('Please fill all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await addDoc(collection(db, 'contact_submissions'), {
                name: form.name,
                email: form.email,
                subject: form.subject,
                message: form.message,
                createdAt: serverTimestamp(),
                status: 'unread'
            });
            setSuccess(true);
            setForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
            showToast('Message sent! We\'ll respond within 24 hours.', 'success');
        } catch (err) {
            setError('Failed to send message. Please try again.');
            showToast('Failed to send message. Try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        { icon: '📧', label: 'Email', value: 'hello@chromaai.in' },
        { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
        { icon: '📍', label: 'Address', value: 'ChromaAI HQ, Koramangala, Bangalore 560034, India' },
        { icon: '🕐', label: 'Working Hours', value: 'Mon–Sat, 9:00 AM – 6:00 PM IST' },
    ];

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <PublicNav />
            <div style={{ height: 64 }} />

            {/* Hero */}
            <div style={{ padding: '80px 60px 60px', textAlign: 'center' }}>
                <div className="hero-badge" style={{ display: 'inline-flex' }}>💬 Get in Touch</div>
                <h1 className="hero-title" style={{ marginTop: 20 }}>
                    Contact <span className="accent">ChromaAI</span>
                </h1>
                <p className="hero-desc" style={{ maxWidth: 500, margin: '0 auto' }}>
                    Have a question, partnership opportunity, or just want to say hello? We'd love to hear from you.
                </p>
            </div>

            {/* Content */}
            <div style={{ padding: '0 60px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, maxWidth: 1100, margin: '0 auto' }}>
                {/* Form */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 40 }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: 8 }}>Send a Message</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 28 }}>We'll get back to you within 24 hours.</p>

                    {success && (
                        <div className="alert alert-success" style={{ marginBottom: 20 }}>
                            ✅ Thank you! We'll get back to you within 24 hours.
                        </div>
                    )}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input id="contact-name" className="form-control" name="name" placeholder="John Smith" value={form.name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input id="contact-email" className="form-control" type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <select id="contact-subject" className="form-control" name="subject" value={form.subject} onChange={handleChange}>
                                <option>General Inquiry</option>
                                <option>Partnership</option>
                                <option>Support</option>
                                <option>Feedback</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message *</label>
                            <textarea
                                id="contact-message"
                                className="form-control"
                                name="message"
                                rows={6}
                                placeholder="Tell us how we can help..."
                                value={form.message}
                                onChange={handleChange}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <button id="contact-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                            {loading ? '⏳ Sending...' : '📩 Send Message →'}
                        </button>
                    </form>
                </div>

                {/* Map + Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Google Maps */}
                    <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', height: 260 }}>
                        <iframe
                            title="ChromaAI Office"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.073706993853!2d77.62432!3d12.934399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1528c5e64a39%3A0xbfef9bd1a5a65474!2sKoramangala%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0, display: 'block' }}
                            allowFullScreen=""
                            loading="lazy"
                        />
                    </div>

                    {/* Contact Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {contactInfo.map(info => (
                            <div key={info.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                                <div style={{ fontSize: 20, marginBottom: 8 }}>{info.icon}</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{info.label}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{info.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '24px 60px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                © 2025 ChromaAI. All rights reserved.
            </div>
        </div>
    );
};

export default Contact;
