// src/pages/About.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Data ─────────────────────────────────────────────────────────────────────
const TEAM = [
    { name: 'Arjun Mehta', role: 'CEO & Co-Founder', emoji: '👨‍💼', location: 'IIT Mumbai', bio: 'Ex-Google AI researcher with 10+ years in paint chemistry and machine learning. Passionate about making technology accessible to every artisan.' },
    { name: 'Priya Sharma', role: 'CTO & Co-Founder', emoji: '👩‍💻', location: 'BITS Pilani', bio: 'Full-stack engineer and ML specialist who architected the 3-model AI pipeline from scratch. Loves turning data into beautiful predictions.' },
    { name: 'Ravi Krishnan', role: 'Head of Product', emoji: '👨‍🎨', location: 'NID Ahmedabad', bio: 'UX visionary turned product leader. Designed every pixel of ChromaAI for 10 million paint decisions per year.' },
    { name: 'Anita Nair', role: 'Head of Manufacturing AI', emoji: '👩‍🔬', location: 'IISc Bangalore', bio: 'Chemical engineer specializing in paint formulation quality optimization. Reduced industry-wide waste by 40%.' },
    { name: 'Vikram Singh', role: 'VP Brand Partnerships', emoji: '👨‍💼', location: 'IIM Calcutta', bio: 'Connected ChromaAI with 50+ paint brands in its first year. Former Category Head at Asian Paints.' },
    { name: 'Sanya Kapoor', role: 'Data Science Lead', emoji: '👩‍🔬', location: 'Stanford University', bio: 'Trained all three AI models on 10,000+ real paint formulation records. Published 3 papers on color ML.' },
];

const MILESTONES = [
    { year: '2022', label: 'Q2', icon: '💡', title: 'Idea Born', desc: 'ChromaAI conceived at IIT Mumbai hackathon. First prototype achieved 72% color prediction accuracy in 48 hours.' },
    { year: '2022', label: 'Q4', icon: '🔬', title: 'Research Phase', desc: 'Collected 10,000+ real paint formulation records from 15 manufacturers across India. Core ML models V1 developed.' },
    { year: '2023', label: 'Q1', icon: '💰', title: 'Seed Funding', desc: 'Secured ₹1.2 Cr seed round from angel investors. Hired first engineering and data science team of 6 people.' },
    { year: '2023', label: 'Q3', icon: '🤖', title: 'AI Models Live', desc: 'All 3 ML models trained and deployed on cloud. Average prediction accuracy reached 94% — beating industry benchmarks.' },
    { year: '2024', label: 'Q1', icon: '🚀', title: 'Platform Launch', desc: 'Public beta launched with 500+ users, 10 brand partners, and 5 manufacturers onboarded in the first 30 days.' },
    { year: '2024', label: 'Q3', icon: '🤝', title: '50 Brand Partners', desc: 'Partnered with AkzoNobel, Berger, Asian Paints, Nerolac and 46+ other brands. Featured in Economic Times.' },
    { year: '2025', label: 'Q1', icon: '📈', title: '1K+ Users', desc: '1,000+ monthly active users. Predictions powering ₹5 Cr+ in annual paint purchases across India.' },
    { year: '2025', label: 'Now', icon: '🌏', title: 'Series A & Expansion', desc: 'Series A funding secured. Expanding to manufacturers in Southeast Asia and the UAE under a SaaS model.' },
];

const VALUES = [
    { icon: '🎨', title: 'Colour-First Thinking', desc: 'Every decision we make is filtered through one question — does this help someone make a better colour choice?' },
    { icon: '🤖', title: 'AI with Purpose', desc: 'We build AI not for technology\'s sake but to solve real frustrations that paint users face daily.' },
    { icon: '🏭', title: 'Manufacturer Empathy', desc: 'We sit on factory floors to understand batch processes before we write a single line of model code.' },
    { icon: '🔍', title: 'Data Rigour', desc: 'Our models are trained only on verified, real-world paint data. No synthetic shortcuts, ever.' },
    { icon: '🤝', title: 'Community Growth', desc: 'We succeed when Indian paint SMEs succeed. Our pricing reflects that — starting free, scaling affordably.' },
    { icon: '🌱', title: 'Sustainable Paint', desc: 'We recommend environmentally-friendly formulations and help manufacturers reduce chemical waste by 40%.' },
];

const AWARDS = [
    { icon: '🏆', title: 'Best AI Startup 2024', org: 'Startup India, Government of India' },
    { icon: '🎖️', title: 'Top 10 Deep-Tech Startups', org: 'NASSCOM Emerge 50, 2024' },
    { icon: '📰', title: 'Featured in Economic Times', org: 'ET TechGadets, March 2024' },
    { icon: '🌟', title: 'IIT Mumbai Alumni Spotlight', org: 'IIT Mumbai Innovation Cell, 2023' },
];

const BRANDS = [
    { name: 'Asian Paints', hex: '#E63946' },
    { name: 'Berger', hex: '#2A9D8F' },
    { name: 'Nerolac', hex: '#E76F51' },
    { name: 'AkzoNobel', hex: '#264653' },
    { name: 'Indigo', hex: '#6A4C93' },
    { name: 'Dulux', hex: '#1982C4' },
];

// ── Shared Nav ────────────────────────────────────────────────────────────────
const PublicNav = () => {
    const navigate = useNavigate();
    const { user, userProfile, logout } = useAuth();
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setAvatarOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initials = userProfile?.name
        ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
    const dashPath = { user: '/user/dashboard', manufacturer: '/manufacturer/dashboard', brand: '/brand/dashboard', admin: '/admin/dashboard' }[userProfile?.role] || '/';

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            backdropFilter: 'blur(20px)',
            background: scrolled ? 'rgba(8,14,26,0.97)' : 'rgba(8,14,26,0.80)',
            borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 48px', height: 64, transition: 'all 0.3s ease',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
                <div className="brand-icon">🎨</div>
                <div className="brand-name">ChromaAI</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
                {[['Home', '/'], ['About', '/about'], ['Why Us', '/why-us'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([l, p]) => (
                    <button key={l} className="btn btn-ghost btn-sm" onClick={() => navigate(p)}
                        style={{ color: p === '/about' ? 'var(--accent)' : undefined }}>{l}</button>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!user ? (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
                    </>
                ) : (
                    <div ref={ref} style={{ position: 'relative' }}>
                        <div className="avatar" onClick={() => setAvatarOpen(!avatarOpen)} style={{ cursor: 'pointer', width: 40, height: 40 }}>{initials}</div>
                        {avatarOpen && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 190, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)', zIndex: 500, overflow: 'hidden' }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{userProfile?.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{userProfile?.role}</div>
                                </div>
                                <button onClick={() => { navigate(dashPath); setAvatarOpen(false); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📊 Dashboard</button>
                                <button onClick={() => { navigate('/profile'); setAvatarOpen(false); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>👤 Profile</button>
                                <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderTop: '1px solid var(--border)', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--danger)' }}>🚪 Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const About = () => {
    const navigate = useNavigate();

    const FW = { width: '100%', padding: '80px 0' }; // full-width section base
    const INNER = { maxWidth: 1200, margin: '0 auto', padding: '0 48px' };

    return (
        <div style={{ background: 'var(--bg-primary)', overflowX: 'hidden' }}>
            <PublicNav />
            <div style={{ height: 64 }} />

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <div style={{
                ...FW, minHeight: '70vh', display: 'flex', alignItems: 'center',
                position: 'relative', overflow: 'hidden', padding: '100px 0 80px',
            }}>
                {/* Paint domain gradient background */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    background: `
            radial-gradient(ellipse 900px 600px at 20% 40%, rgba(245,158,11,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 600px 500px at 80% 60%, rgba(16,185,129,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 500px 400px at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 55%),
            linear-gradient(160deg, #080E1A 0%, #0F172A 60%, #080E1A 100%)
          `,
                }} />

                {/* Top rainbow strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, zIndex: 2, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6,#EC4899)' }} />

                {/* Floating paint-bucket blobs */}
                {[
                    { top: '20%', left: '3%', w: 200, h: 160, color: 'rgba(245,158,11,0.06)' },
                    { top: '55%', left: '1%', w: 140, h: 140, color: 'rgba(16,185,129,0.06)' },
                    { top: '15%', right: '4%', w: 240, h: 180, color: 'rgba(59,130,246,0.06)' },
                    { top: '65%', right: '6%', w: 160, h: 140, color: 'rgba(168,85,247,0.06)' },
                ].map((b, i) => (
                    <div key={i} style={{
                        position: 'absolute', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 70%',
                        width: b.w, height: b.h, background: b.color,
                        top: b.top, left: b.left, right: b.right,
                        filter: 'blur(24px)', zIndex: 0,
                        animation: 'blobFloat 7s ease-in-out infinite alternate',
                        animationDelay: `${i * 0.8}s`,
                    }} />
                ))}

                <div style={{ ...INNER, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 24 }}>🎨 Our Story</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
                        Painting India's Future<br />
                        <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            with Artificial Intelligence
                        </span>
                    </h1>
                    <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'var(--text-secondary)', maxWidth: 660, margin: '0 auto 40px', lineHeight: 1.9 }}>
                        ChromaAI was born from a simple question asked at an IIT Mumbai hackathon:<br />
                        <em style={{ color: 'var(--text-primary)' }}>"Why is choosing the right paint colour still so hard in 2024?"</em><br />
                        We spent 2 years answering it with data, AI, and a deep love for the paint industry.
                    </p>

                    {/* Paint swatches as hero decoration */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        {[['#FFFFFF', 'Chalk'], ['#F5E6C8', 'Beige'], ['#9CA3AF', 'Grey'], ['#C27A57', 'Terra'], ['#8FAF8C', 'Sage'], ['#1E3A5F', 'Navy'], ['#374151', 'Charcoal'], ['#6B7C45', 'Olive']].map(([hex, name]) => (
                            <div key={name} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10, background: hex,
                                    border: '2px solid rgba(255,255,255,0.08)',
                                    boxShadow: `0 4px 14px ${hex}44`, marginBottom: 4,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15) translateY(-4px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${hex}77`; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 14px ${hex}44`; }} />
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MISSION & VISION ───────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label">Purpose</div>
                        <h2 className="section-title">Why We Exist</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            { icon: '🎯', title: 'Mission', text: 'To democratize paint intelligence — making AI-powered colour prediction and manufacturing optimization accessible to every customer, manufacturer, and brand in India and beyond.' },
                            { icon: '🔭', title: 'Vision', text: 'A world where every painted surface is perfect — where manufacturers waste zero material, customers always love their walls, and brands connect with the right buyers at the right moment.' },
                            { icon: '🌏', title: 'Impact', text: 'By 2027, we aim to power 10 million annual paint decisions, reduce India\'s paint industry waste by 25%, and help 10,000 manufacturers optimize production quality through AI.' },
                        ].map(c => (
                            <div key={c.title} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: 40, textAlign: 'center',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <div style={{ fontSize: 44, marginBottom: 18 }}>{c.icon}</div>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: 14, color: 'var(--accent)' }}>{c.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>{c.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── STATS BANNER ──────────────────────────────────────────────── */}
            <div style={{
                ...FW, padding: '72px 0',
                background: 'linear-gradient(135deg, #0F172A 0%, #111827 50%, #0F172A 100%)',
                borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
                <div style={{ ...INNER, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24, textAlign: 'center' }}>
                        {[
                            { val: '3', label: 'AI Models', icon: '🤖' },
                            { val: '10K+', label: 'Training Data Points', icon: '📊' },
                            { val: '97%', label: 'Max Accuracy', icon: '🎯' },
                            { val: '500+', label: 'Paint Products', icon: '🎨' },
                            { val: '50+', label: 'Brand Partners', icon: '🤝' },
                            { val: '1,000+', label: 'Monthly Users', icon: '👥' },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, color: 'var(--accent)' }}>{s.val}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── OUR DOMAIN (PAINT INDUSTRY) ───────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-primary)' }}>
                <div style={INNER}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
                        <div>
                            <div className="section-label">Domain Focus</div>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>
                                Built for India's<br />
                                <span style={{ color: 'var(--accent)' }}>₹60,000 Crore</span><br />
                                Paint Industry
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 28, fontSize: '0.95rem' }}>
                                The Indian paint industry serves 1.4 billion people but still relies on manual guesswork for colour selection and batch quality decisions. ChromaAI is the first AI platform built specifically for this industry's unique challenges.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { icon: '🏠', text: '500 million walls painted annually in India need better colour selection' },
                                    { icon: '🏭', text: '10,000+ paint manufacturers still use manual QC processes' },
                                    { icon: '🎨', text: '500+ SKUs in a typical paint brand — too much choice, no AI guidance' },
                                    { icon: '♻️', text: '15% average paint waste per batch due to poor formulation prediction' },
                                    { icon: '📱', text: 'Only 2% of paint purchases are currently influenced by digital AI tools' },
                                ].map(p => (
                                    <div key={p.text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{p.icon}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{p.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Colour grid visual */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                            {[
                                '#FFFFFF', '#FEFCE8', '#F5E6C8', '#FDE68A', '#FCA5A5',
                                '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569',
                                '#C27A57', '#B45309', '#92400E', '#78350F', '#451A03',
                                '#8FAF8C', '#6B7C45', '#4D7C0F', '#3F6212', '#1A2E05',
                                '#93C5FD', '#3B82F6', '#1E3A5F', '#1E40AF', '#1E3A8A',
                                '#C4B5FD', '#8B5CF6', '#7C3AED', '#6D28D9', '#4C1D95',
                            ].map((hex, i) => (
                                <div key={i} style={{
                                    aspectRatio: '1', borderRadius: 8, background: hex,
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 6px 18px ${hex}55`; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── VALUES ────────────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">Culture</div>
                        <h2 className="section-title">What We Stand For</h2>
                        <p className="section-subtitle">Six principles that guide every product decision we make at ChromaAI.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {VALUES.map(v => (
                            <div key={v.title} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: 28,
                                transition: 'var(--transition)', display: 'flex', flexDirection: 'column', gap: 12,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-glow)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{v.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{v.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>{v.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TEAM ──────────────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-primary)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">The People</div>
                        <h2 className="section-title">Meet Our Team</h2>
                        <p className="section-subtitle">World-class engineers, chemists, and designers united by a love for paint and AI.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {TEAM.map(t => (
                            <div key={t.name} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: 28, textAlign: 'center',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px', boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}>{t.emoji}</div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 3 }}>{t.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t.role}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>🎓 {t.location}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t.bio}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── VERTICAL TIMELINE ─────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">Journey</div>
                        <h2 className="section-title">How ChromaAI Was Built</h2>
                        <p className="section-subtitle">From a 48-hour hackathon prototype to India's leading paint AI platform.</p>
                    </div>

                    {/* Alternating timeline */}
                    <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
                        {/* Centre line */}
                        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, var(--accent), rgba(245,158,11,0.1))', transform: 'translateX(-50%)' }} />

                        {MILESTONES.map((m, i) => {
                            const isLeft = i % 2 === 0;
                            return (
                                <div key={i} style={{ display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', marginBottom: 40, position: 'relative' }}>
                                    {/* Centre bubble */}
                                    <div style={{
                                        position: 'absolute', left: '50%', top: 16, transform: 'translateX(-50%)',
                                        width: 44, height: 44, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 20, zIndex: 2, boxShadow: '0 0 0 4px var(--bg-secondary), 0 0 16px rgba(245,158,11,0.3)',
                                    }}>{m.icon}</div>

                                    {/* Content card */}
                                    <div style={{
                                        width: '44%',
                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)', padding: 22,
                                        marginLeft: isLeft ? 0 : undefined,
                                        marginRight: isLeft ? undefined : 0,
                                        transition: 'border-color 0.2s, transform 0.2s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = isLeft ? 'translateX(-4px)' : 'translateX(4px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
                                            {m.year} · {m.label}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{m.title}</div>
                                        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{m.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── BRAND LOGOS ───────────────────────────────────────────────── */}
            <div style={{ ...FW, padding: '60px 0', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div className="section-label">Partners</div>
                        <h2 className="section-title">Brand Partners</h2>
                        <p className="section-subtitle">Trusted by some of India's most iconic paint brands.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {BRANDS.map(b => (
                            <div key={b.name} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 12, padding: '18px 28px',
                                display: 'flex', alignItems: 'center', gap: 14, minWidth: 160,
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = b.hex; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: b.hex, flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── AWARDS ────────────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label">Recognition</div>
                        <h2 className="section-title">Awards & Press</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                        {AWARDS.map(a => (
                            <div key={a.title} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: '28px 22px', textAlign: 'center',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                <div style={{ fontSize: 40, marginBottom: 14 }}>{a.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>{a.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{a.org}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TECH STACK VISUAL ─────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
                        <div>
                            <div className="section-label">Technology</div>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>
                                What Powers ChromaAI
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 28, fontSize: '0.95rem' }}>
                                A production-grade AI stack purpose-built for paint intelligence — combining scikit-learn ML models, a FastAPI backend, Firebase real-time database, and a React 19 frontend.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { label: 'Frontend', value: 'React 19', icon: '⚛️' },
                                    { label: 'Backend', value: 'FastAPI (Python)', icon: '⚡' },
                                    { label: 'Database', value: 'Firebase Firestore', icon: '🔥' },
                                    { label: 'Auth', value: 'Firebase Auth', icon: '🔐' },
                                    { label: 'ML Models', value: 'scikit-learn', icon: '🤖' },
                                    { label: 'Payments', value: 'Razorpay INR', icon: '💳' },
                                ].map(t => (
                                    <div key={t.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span style={{ fontSize: 20 }}>{t.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t.label}</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{t.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* AI accuracy visual */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>AI Model Performance</div>
                            {[
                                { name: 'Model 1 — Colour Recommender', acc: 94, color: 'var(--accent)' },
                                { name: 'Model 2 — Chemical Predictor', acc: 89, color: 'var(--info)' },
                                { name: 'Model 3 — Quality Optimizer', acc: 97, color: 'var(--success)' },
                            ].map(m => (
                                <div key={m.name} style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                                        <span style={{ fontWeight: 700, color: m.color }}>{m.acc}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${m.acc}%`, background: `linear-gradient(90deg, ${m.color}99, ${m.color})`, transition: 'width 1.2s ease' }} />
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop: 24, padding: 14, background: 'var(--accent-glow)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.8rem', color: 'var(--accent)' }}>
                                🔄 Models are retrained monthly on new real-world paint formulation data.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CTA ───────────────────────────────────────────────────────── */}
            <div style={{
                ...FW, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, #0F172A 0%, #1A1A2E 100%)',
                borderTop: '1px solid var(--border)',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6)' }} />
                <div style={{ ...INNER, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 20 }}>🚀 Join the ChromaAI Community</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>
                        Ready to Bring AI to<br />
                        <span style={{ color: 'var(--accent)' }}>Your Paint Workflow?</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1rem', maxWidth: 480, margin: '0 auto 36px' }}>
                        Sign up free in 30 seconds. No credit card needed. Experience the future of paint colour intelligence today.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-lg" style={{ padding: '14px 36px' }} onClick={() => navigate('/register')}>
                            🎨 Start Free Today →
                        </button>
                        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/contact')}>Talk to Us</button>
                    </div>
                </div>
            </div>

            {/* ── FOOTER ────────────────────────────────────────────────────── */}
            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '32px 48px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                    {[['Home', '/'], ['Why Us', '/why-us'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([l, p]) => (
                        <span key={l} style={{ cursor: 'pointer' }} onClick={() => navigate(p)}>{l}</span>
                    ))}
                </div>
                © 2025 ChromaAI. All rights reserved. · Built in India 🇮🇳
            </div>

            <style>{`
        @keyframes blobFloat {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(16px,-16px) scale(1.08); }
        }
        @media (max-width: 900px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="grid-template-columns: repeat(6"] { grid-template-columns: repeat(3, 1fr) !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
        </div>
    );
};

export default About;
