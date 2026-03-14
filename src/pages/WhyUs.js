// src/pages/WhyUs.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Data ─────────────────────────────────────────────────────────────────────
const PROBLEMS = [
    { icon: '😤', title: 'Wrong Colour Every Time', desc: 'Paint chips in stores look completely different on your wall. Hours of re-sampling, wrong purchases, repaint costs.' },
    { icon: '🧪', title: 'Manufacturer Guesswork', desc: 'Paint batches fail quality checks due to manual formulation decisions. Every failure costs time, material, and money.' },
    { icon: '💸', title: 'No Targeted Brand Reach', desc: 'Brands spend crores on advertising to mass audiences when buyers who need their exact product are making decisions right now.' },
    { icon: '📊', title: 'Zero Data Intelligence', desc: 'No centralised platform gives manufacturers or brands real insight into what colours consumers are choosing, and why.' },
];

const SOLUTIONS = [
    { icon: '🎨', problem: 'Wrong Color Picks', solution: 'AI Color Recommender', detail: 'Model 1 analyses your surface type, environment, area size, and lighting to recommend the statistically optimal colour — 94% accuracy.' },
    { icon: '⚗️', problem: 'Batch Quality Failures', solution: 'Chemical Property Predictor', detail: 'Model 2 predicts exact colour output from your pigment and solvent ratios before you manufacture a single litre.' },
    { icon: '🏭', problem: 'QC After Production', solution: 'Production Quality Optimizer', detail: 'Model 3 predicts viscosity, purity, and quality score from mixing conditions — catching issues before they become failures.' },
    { icon: '📢', problem: 'Wasteful Brand Ads', solution: 'Targeted Brand Marketplace', detail: 'Brands reach users at the exact moment they\'re choosing paint, targeted by colour, surface, and environment match.' },
];

const ADVANTAGES = [
    { icon: '🤖', title: '3-Model AI Pipeline', desc: 'The only platform with 3 specialised ML models covering the entire paint lifecycle — from customer selection to manufacturing QC.', stat: '3 Models', statLabel: 'Specialised AI' },
    { icon: '🎯', title: '94–97% Accuracy', desc: 'Trained on 10,000+ verified real-world paint formulation records from 15+ Indian manufacturers.', stat: '94-97%', statLabel: 'Prediction Accuracy' },
    { icon: '⚡', title: 'Instant Results', desc: 'Sub-second inference. No waiting, no sampling, no guesswork. Get an AI-powered decision in under 500ms.', stat: '<500ms', statLabel: 'Prediction Time' },
    { icon: '🔄', title: 'Real-Time Data Sync', desc: 'Firebase-powered live dashboards. Every prediction, ad impression, and activity is propagated across all portals instantly.', stat: '0ms', statLabel: 'Data Lag' },
    { icon: '💳', title: 'Made for India', desc: 'INR pricing, Razorpay payments (UPI, cards, net banking). Built on Indian cloud infrastructure. DPDP compliant.', stat: '₹1,599', statLabel: 'Starting Price/Month' },
    { icon: '🏭', title: 'Multi-Role Platform', desc: 'One platform, four roles — users, manufacturers, brand partners, and admins — each with a dedicated, purpose-built portal.', stat: '4 Roles', statLabel: 'Unified Platform' },
];

const TABLE_ROWS = [
    { feature: 'AI Colour Prediction (End User)', chroma: '✅', trad: '❌', competitor: '⚠️ Basic' },
    { feature: 'Chemical Formulation → Colour', chroma: '✅', trad: '❌', competitor: '❌' },
    { feature: 'Manufacturing Quality Optimizer', chroma: '✅', trad: '❌', competitor: '❌' },
    { feature: 'Brand Targeted Ad Marketplace', chroma: '✅', trad: '❌', competitor: '⚠️ Limited' },
    { feature: 'Multi-Role Portals', chroma: '✅', trad: '❌', competitor: '⚠️ Partial' },
    { feature: 'Real-Time Dashboard Analytics', chroma: '✅', trad: '❌', competitor: '⚠️ Delayed' },
    { feature: 'Subscription Plans (INR)', chroma: '✅', trad: '❌', competitor: '❌' },
    { feature: 'Firestore Real-Time Sync', chroma: '✅', trad: '❌', competitor: '❌' },
    { feature: 'Free Plan Available', chroma: '✅', trad: 'N/A', competitor: '⚠️ Trial Only' },
    { feature: 'Mobile Responsive UI', chroma: '✅', trad: '❌', competitor: '⚠️ Partial' },
];

const TESTIMONIALS = [
    { name: 'Rahul Verma', role: 'Interior Designer, Mumbai', text: 'I used to spend 3 days sampling colours for clients. ChromaAI delivers the perfect recommendation in 30 seconds. My client satisfaction score went from 72% to 96% in 3 months.', avatar: '👨‍🎨', rating: 5, plan: 'Premium' },
    { name: 'PaintCo Industries', role: 'Paint Manufacturer, Pune', text: 'Batch failures dropped 40% in just 2 months. The Quality Optimizer caught a pigment ratio issue that would have wasted ₹4 lakh of material. The ROI was 10x in the first quarter alone.', avatar: '🏭', rating: 5, plan: 'Pro' },
    { name: 'ColourHouse Brands', role: 'Brand Manager, Delhi', text: 'Our ads now appear to users at the exact moment they\'re choosing paint. Our CTR tripled and cost-per-acquisition dropped 60%. No other platform offers this level of targeting.', avatar: '🏷️', rating: 5, plan: 'Brand Partner' },
    { name: 'Priya Joshi', role: 'Homeowner, Bangalore', text: 'Chose the colour for my 3BHK entirely through ChromaAI. The AI accounted for my north-facing rooms getting less sunlight. The walls look exactly as recommended. Absolutely magical!', avatar: '🏠', rating: 5, plan: 'Free → Premium' },
    { name: 'AkzoNobel India', role: 'Brand Partner, Mumbai', text: 'ChromaAI\'s targeted placement is genius. Our eco-friendly range now appears to exactly the sustainability-conscious users who recommended earth-tone colours. Conversion is 3x industry average.', avatar: '🌿', rating: 5, plan: 'Brand Enterprise' },
    { name: 'Mr. Suresh Naidu', role: 'Production Manager, Mysore', text: 'We\'ve been in paint manufacturing for 22 years. ChromaAI\'s formulation predictor is the first tool that actually understands our process. Our quality consistency improved from 81% to 97%.', avatar: '⚙️', rating: 5, plan: 'Pro' },
];

const METRICS = [
    { value: '40%', label: 'Reduction in batch failures', icon: '📉', color: 'var(--success)' },
    { value: '3×', label: 'Higher ad CTR for brands', icon: '📈', color: 'var(--accent)' },
    { value: '97%', label: 'Max QC accuracy', icon: '🎯', color: 'var(--info)' },
    { value: '60%', label: 'Drop in sampling costs', icon: '💰', color: '#8B5CF6' },
];

const PROCESS = [
    { step: '01', icon: '📝', title: 'Tell Us Your Situation', desc: 'Answer 4–5 quick questions about your surface, environment, area size, and colour preference. No technical knowledge needed.' },
    { step: '02', icon: '🤖', title: 'AI Models Analyse', desc: 'Our 3-model pipeline processes your inputs against 10,000+ training data points in real time to find the perfect match.' },
    { step: '03', icon: '🎨', title: 'Receive Precision Results', desc: 'Get an exact colour name, hex code, product recommendations, and confidence score delivered in under 500ms.' },
    { step: '04', icon: '🛒', title: 'Buy from Matched Brands', desc: 'Sponsored brand products that exactly match your recommended colour appear — ready to purchase with one click.' },
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
                        style={{ color: p === '/why-us' ? 'var(--accent)' : undefined }}>{l}</button>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!user ? (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started Free</button>
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

// ── Page Component ────────────────────────────────────────────────────────────
const WhyUs = () => {
    const navigate = useNavigate();
    const FW = { width: '100%', padding: '80px 0' };
    const INNER = { maxWidth: 1200, margin: '0 auto', padding: '0 48px' };

    return (
        <div style={{ background: 'var(--bg-primary)', overflowX: 'hidden' }}>
            <PublicNav />
            <div style={{ height: 64 }} />

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <div style={{
                ...FW, minHeight: '68vh', display: 'flex', alignItems: 'center',
                position: 'relative', overflow: 'hidden', padding: '100px 0 80px',
            }}>
                {/* Paint-domain gradient bg */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    background: `
            radial-gradient(ellipse 800px 600px at 15% 40%, rgba(245,158,11,0.11) 0%, transparent 60%),
            radial-gradient(ellipse 600px 500px at 85% 65%, rgba(16,185,129,0.09) 0%, transparent 55%),
            radial-gradient(ellipse 500px 400px at 55% 5%, rgba(59,130,246,0.07) 0%, transparent 55%),
            linear-gradient(160deg, #080E1A 0%, #0F172A 60%, #080E1A 100%)
          `,
                }} />

                {/* Top rainbow stripe */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, zIndex: 2, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6,#EC4899)' }} />

                {/* Floating paint blobs */}
                {[
                    { top: '18%', left: '4%', w: 200, h: 160, color: 'rgba(245,158,11,0.07)', delay: '0s' },
                    { top: '62%', left: '2%', w: 130, h: 130, color: 'rgba(16,185,129,0.06)', delay: '1s' },
                    { top: '20%', right: '3%', w: 240, h: 200, color: 'rgba(59,130,246,0.07)', delay: '0.5s' },
                    { top: '68%', right: '5%', w: 160, h: 140, color: 'rgba(168,85,247,0.06)', delay: '1.5s' },
                ].map((b, i) => (
                    <div key={i} style={{
                        position: 'absolute', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 70%',
                        width: b.w, height: b.h, background: b.color,
                        top: b.top, left: b.left, right: b.right,
                        filter: 'blur(24px)', zIndex: 0,
                        animation: 'blobFloat 7s ease-in-out infinite alternate',
                        animationDelay: b.delay,
                    }} />
                ))}

                <div style={{ ...INNER, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 24 }}>🏆 Why Choose ChromaAI</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
                        Stop Guessing.<br />
                        <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Start Predicting.
                        </span>
                    </h1>
                    <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto 40px', lineHeight: 1.9 }}>
                        The Indian paint industry loses <strong style={{ color: 'var(--danger)' }}>₹8,000 crore annually</strong> to bad colour choices, failed batches, and wasteful advertising.
                        ChromaAI is the only platform that solves all three problems — at the same time.
                    </p>

                    {/* Metric pills */}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
                        {METRICS.map(m => (
                            <div key={m.label} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 999, padding: '10px 20px',
                            }}>
                                <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 700, color: m.color, fontSize: '1rem', lineHeight: 1 }}>{m.value}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-lg" style={{ padding: '14px 32px' }} onClick={() => navigate('/register')}>
                            🚀 Start Free — No Card Needed
                        </button>
                        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/pricing')}>
                            View Pricing →
                        </button>
                    </div>
                </div>
            </div>

            {/* ── PROBLEM WE SOLVE ──────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">The Problem</div>
                        <h2 className="section-title">The Paint Industry is Broken</h2>
                        <p className="section-subtitle">These 4 costly problems affect every stakeholder in India's ₹60,000 crore paint industry — and nobody had built a unified solution. Until now.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                        {PROBLEMS.map((p, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 'var(--radius)', padding: 32, display: 'flex', gap: 20,
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <div style={{ fontSize: 40, flexShrink: 0 }}>{p.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8, color: 'var(--danger)' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>{p.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── OUR SOLUTION ──────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-primary)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">Our Solution</div>
                        <h2 className="section-title">ChromaAI Solves Every One</h2>
                        <p className="section-subtitle">For each of the 4 industry problems, we built a dedicated, specialised AI solution — integrated into one intelligent platform.</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {SOLUTIONS.map((s, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', overflow: 'hidden', display: 'grid',
                                gridTemplateColumns: '60px 1fr 1fr',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                {/* Number column */}
                                <div style={{ background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                    {s.icon}
                                </div>
                                {/* Problem */}
                                <div style={{ padding: '20px 24px', borderRight: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>❌ Problem</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.problem}</div>
                                </div>
                                {/* Solution */}
                                <div style={{ padding: '20px 24px' }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>✅ ChromaAI Solution</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--accent)', marginBottom: 4 }}>{s.solution}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">Process</div>
                        <h2 className="section-title">So Simple, It Feels Like Magic</h2>
                        <p className="section-subtitle">4 steps from your question to a perfect paint colour — average time: 45 seconds.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 36, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg, var(--accent), rgba(245,158,11,0.2))', zIndex: 0 }} />
                        {PROCESS.map((p, i) => (
                            <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 30, margin: '0 auto 16px',
                                    boxShadow: '0 0 0 6px var(--bg-secondary), 0 0 20px rgba(245,158,11,0.3)',
                                }}>{p.icon}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.15em', marginBottom: 8 }}>STEP {p.step}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>{p.title}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{p.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── KEY ADVANTAGES ────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">Key Advantages</div>
                        <h2 className="section-title">6 Reasons ChromaAI Wins</h2>
                        <p className="section-subtitle">Industry-first capabilities that no traditional tool or competitor offers in a single platform.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {ADVANTAGES.map((a, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: 28, transition: 'var(--transition)',
                                display: 'flex', flexDirection: 'column', gap: 0,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-glow)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{a.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{a.title}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{a.desc}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>{a.stat}</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.statLabel}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label">Comparison</div>
                        <h2 className="section-title">ChromaAI vs The Alternatives</h2>
                        <p className="section-subtitle">See exactly what you get with ChromaAI that you can't get anywhere else.</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-elevated)' }}>
                                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '2px solid var(--border)' }}>Feature</th>
                                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, borderBottom: '2px solid var(--accent)', background: 'rgba(245,158,11,0.05)', minWidth: 140 }}>🎨 ChromaAI</th>
                                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '2px solid var(--border)', minWidth: 120 }}>Traditional</th>
                                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '2px solid var(--border)', minWidth: 130 }}>Competitors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TABLE_ROWS.map((row, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '13px 20px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{row.feature}</td>
                                        <td style={{ padding: '13px 20px', textAlign: 'center', fontSize: '1rem', background: 'rgba(245,158,11,0.03)', fontWeight: 700, color: 'var(--success)' }}>{row.chroma}</td>
                                        <td style={{ padding: '13px 20px', textAlign: 'center', fontSize: '0.875rem', color: row.trad === '❌' ? 'var(--danger)' : 'var(--text-muted)' }}>{row.trad}</td>
                                        <td style={{ padding: '13px 20px', textAlign: 'center', fontSize: '0.82rem', color: row.competitor.startsWith('⚠️') ? 'var(--accent)' : row.competitor === '❌' ? 'var(--danger)' : 'var(--text-secondary)' }}>{row.competitor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: 14, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>⚠️ = Partial or limited implementation</div>
                </div>
            </div>

            {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">Social Proof</div>
                        <h2 className="section-title">Real Results, Real People</h2>
                        <p className="section-subtitle">From homeowners to enterprise manufacturers — hear what our community says about ChromaAI.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: 26, display: 'flex', flexDirection: 'column',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                {/* Stars */}
                                <div style={{ color: '#FCD34D', fontSize: '0.85rem', marginBottom: 12, letterSpacing: 2 }}>{'★'.repeat(t.rating)}</div>
                                {/* Quote */}
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20, flex: 1 }}>❝{t.text}❞</p>
                                {/* Author */}
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{ width: 45, height: 45, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{t.avatar}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.role}</div>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 999, padding: '3px 8px', flexShrink: 0 }}>{t.plan}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FOR EACH ROLE ──────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <div className="section-label">For Everyone</div>
                        <h2 className="section-title">ChromaAI Works for Your Role</h2>
                        <p className="section-subtitle">Whether you're a homeowner, manufacturer, or brand — ChromaAI has a dedicated portal built exactly for you.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            {
                                icon: '🏠', role: 'For Users / Designers',
                                cardAccent: 'rgba(245,158,11,0.15)',
                                border: 'rgba(245,158,11,0.3)',
                                benefits: [
                                    'AI colour recommendation in 30 sec',
                                    'Surface & environment-aware AI',
                                    'Curated product marketplace',
                                    'Prediction history & reuse',
                                    '5 free predictions/month',
                                ],
                                cta: 'Start as User',
                            },
                            {
                                icon: '🏭', role: 'For Manufacturers',
                                cardAccent: 'rgba(16,185,129,0.12)',
                                border: 'rgba(16,185,129,0.3)',
                                benefits: [
                                    'Pigment → colour prediction',
                                    'Quality score before production',
                                    'Viscosity & purity forecasting',
                                    'Batch failure prevention',
                                    'Real-time production dashboard',
                                ],
                                cta: 'Start as Manufacturer',
                            },
                            {
                                icon: '🏷️', role: 'For Brand Partners',
                                cardAccent: 'rgba(59,130,246,0.12)',
                                border: 'rgba(59,130,246,0.3)',
                                benefits: [
                                    'Targeted ads at point of decision',
                                    'Colour & surface-based targeting',
                                    'Live CTR & impression analytics',
                                    'Admin-reviewed ad approval',
                                    'Branded market insights',
                                ],
                                cta: 'Start as Brand',
                            },
                        ].map(r => (
                            <div key={r.role} style={{
                                background: r.cardAccent, border: `1px solid ${r.border}`,
                                borderRadius: 'var(--radius)', padding: 32,
                                display: 'flex', flexDirection: 'column', gap: 0,
                            }}>
                                <div style={{ fontSize: 44, marginBottom: 16 }}>{r.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>{r.role}</div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                                    {r.benefits.map(b => (
                                        <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }}>✓</span>
                                            {b}
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-primary btn-full" onClick={() => navigate('/register')}>{r.cta} →</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TRUST INDICATORS ──────────────────────────────────────────── */}
            <div style={{
                ...FW, padding: '60px 0',
                background: 'linear-gradient(135deg, #0F172A 0%, #111827 100%)',
                borderTop: '1px solid var(--border)',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />
                <div style={{ ...INNER, position: 'relative' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div className="section-label">Trust & Security</div>
                        <h2 className="section-title">You're in Safe Hands</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                        {[
                            { icon: '🔐', title: 'Firebase Auth', desc: 'Enterprise-grade authentication with email verification and secure session management.' },
                            { icon: '🔒', title: 'Razorpay Secured', desc: 'All payments processed via PCI-DSS compliant Razorpay. Your card data never touches our servers.' },
                            { icon: '🛡️', title: 'DPDP Compliant', desc: 'Built to comply with India\'s Digital Personal Data Protection Act, 2023.' },
                            { icon: '☁️', title: 'Firebase Cloud', desc: 'Data stored on Google Firebase — 99.99% uptime SLA and real-time encryption at rest.' },
                        ].map(t => (
                            <div key={t.title} style={{
                                background: '#111827', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: '24px 20px', textAlign: 'center',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                <div style={{ fontSize: 36, marginBottom: 14 }}>{t.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>{t.title}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{t.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA BANNER ────────────────────────────────────────────────── */}
            <div style={{
                ...FW, position: 'relative', overflow: 'hidden',
                background: 'var(--bg-primary)', borderTop: '1px solid var(--border)',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(245,158,11,0.09) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6)' }} />
                <div style={{ ...INNER, position: 'relative', textAlign: 'center' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 24 }}>🎨 The Smarter Choice</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>
                        Join 1,000+ Users Who Chose<br />
                        <span style={{ color: 'var(--accent)' }}>AI over Guesswork</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1rem', maxWidth: 500, margin: '0 auto 36px' }}>
                        Start free in 30 seconds. 5 AI predictions included. No credit card. No commitment. Just better paint decisions — forever.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-lg" style={{ padding: '14px 36px', fontSize: '1rem' }} onClick={() => navigate('/register')}>
                            Create Free Account →
                        </button>
                        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/contact')}>Talk to Sales</button>
                    </div>
                    <div style={{ marginTop: 24, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['✅ No credit card needed', '✅ 5 free predictions/month', '✅ Cancel anytime', '✅ INR pricing'].map(b => (
                            <span key={b} style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FOOTER ────────────────────────────────────────────────────── */}
            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '28px 48px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
                    {[['Home', '/'], ['About', '/about'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([l, p]) => (
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
        @media (max-width: 1024px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 60px 1fr 1fr"] { grid-template-columns: 60px 1fr !important; }
        }
        @media (max-width: 640px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(2, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(4, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
        </div>
    );
};

export default WhyUs;
