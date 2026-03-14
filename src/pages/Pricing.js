// src/pages/Pricing.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/common/Toast';

// ── Razorpay loader ───────────────────────────────────────────────────────────
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere';
const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
});

// ── Data ─────────────────────────────────────────────────────────────────────
const PLANS = [
    {
        name: 'Free', icon: '🪙', priceINR: 0, priceDisplay: '₹0',
        razorpayAmount: 0, period: 'Forever free', planKey: 'free',
        color: '#6B7280', accent: 'rgba(107,114,128,0.15)',
        tagline: 'Perfect to get started',
        features: [
            '5 AI colour predictions / month',
            'Basic colour recommendations',
            '3 surface types supported',
            'Community forum access',
            'Prediction history (last 10)',
        ],
        notIncluded: [
            'Unlimited predictions',
            'Chemical formulation AI',
            'Batch quality monitoring',
            'API access',
            'Priority support',
        ],
        featured: false, cta: 'Get Started Free',
    },
    {
        name: 'Premium', icon: '⭐', priceINR: 1599, priceDisplay: '₹1,599',
        razorpayAmount: 159900, period: '/month', planKey: 'premium',
        color: '#F59E0B', accent: 'rgba(245,158,11,0.12)',
        tagline: 'Best for power users & designers',
        features: [
            'Unlimited AI colour predictions',
            'Full AI recommendation engine',
            'All 5 surface types supported',
            'Product marketplace access',
            'Sponsored brand products',
            'Prediction history (unlimited)',
            'CSV export of history',
            'Priority email support (24h)',
        ],
        notIncluded: [
            'API access',
            'Dedicated account manager',
        ],
        featured: true, cta: 'Upgrade to Premium',
    },
    {
        name: 'Pro', icon: '🚀', priceINR: 3999, priceDisplay: '₹3,999',
        razorpayAmount: 399900, period: '/month', planKey: 'pro',
        color: '#8B5CF6', accent: 'rgba(139,92,246,0.12)',
        tagline: 'For manufacturers & enterprises',
        features: [
            'Everything in Premium',
            'Chemical formulation predictor',
            'Batch quality optimizer (QC AI)',
            'Advanced production analytics',
            'REST API access (10K calls/month)',
            'Webhook integrations',
            'Dedicated account manager',
            'SLA support (4h response)',
            'Custom model fine-tuning',
        ],
        notIncluded: [],
        featured: false, cta: 'Upgrade to Pro',
    },
];

const FEATURE_COMPARE = [
    { label: 'AI Colour Predictions', free: '5/month', premium: 'Unlimited', pro: 'Unlimited' },
    { label: 'Surface Types', free: '3 types', premium: 'All 5', pro: 'All 5 + Custom' },
    { label: 'Prediction History', free: 'Last 10', premium: 'Unlimited', pro: 'Unlimited' },
    { label: 'CSV Export', free: '❌', premium: '✅', pro: '✅' },
    { label: 'Chemical Formulation AI', free: '❌', premium: '❌', pro: '✅' },
    { label: 'Batch Quality Optimizer', free: '❌', premium: '❌', pro: '✅' },
    { label: 'API Access', free: '❌', premium: '❌', pro: '✅ (10K/mo)' },
    { label: 'Product Marketplace', free: '❌', premium: '✅', pro: '✅' },
    { label: 'Priority Support', free: '❌', premium: '✅ 24h', pro: '✅ 4h SLA' },
    { label: 'Dedicated Manager', free: '❌', premium: '❌', pro: '✅' },
];

const FAQS = [
    { q: 'Can I switch plans at any time?', a: 'Yes! Upgrade anytime and your new plan activates instantly after payment. Downgrading will take effect at the end of your billing cycle.' },
    { q: 'What payment methods does Razorpay support?', a: 'Razorpay accepts UPI (Google Pay, PhonePe, Paytm), all major credit/debit cards (Visa, Mastercard, Rupay), Net Banking for 50+ banks, and digital wallets.' },
    { q: 'Is the Free plan really free forever?', a: 'Yes! The Free plan is permanently free with 5 AI colour predictions per month — no credit card needed, no trial expiry.' },
    { q: 'What happens after my payment on Razorpay?', a: 'Your plan upgrades instantly. A payment confirmation is stored in your account, and a notification is sent to your dashboard. No manual activation needed.' },
    { q: 'Can manufacturers and brands use ChromaAI?', a: 'Absolutely. The Pro plan is designed specifically for manufacturers with Chemical Formulation AI and Batch QC features. Brands get a dedicated partner portal.' },
    { q: 'Is my payment and data secure?', a: 'All payments are processed by Razorpay — PCI-DSS Level 1 certified. Your data is stored on Firebase with encryption at rest and in transit. We never store card details.' },
    { q: 'Can I get a refund?', a: 'We offer a 7-day refund policy. If ChromaAI doesn\'t meet your expectations within the first 7 days after upgrading, contact support for a full refund.' },
    { q: 'Is there an annual plan with a discount?', a: 'Annual billing coming soon! Sign up for our newsletter to get notified — annual subscribers will receive 2 months free (≈17% discount).' },
];

const PAYMENT_METHODS = [
    { icon: '📱', name: 'UPI', detail: 'Google Pay, PhonePe, Paytm, BHIM' },
    { icon: '💳', name: 'Cards', detail: 'Visa, Mastercard, RuPay, Amex' },
    { icon: '🏦', name: 'Net Banking', detail: '50+ Indian Banks' },
    { icon: '👛', name: 'Wallets', detail: 'Amazon Pay, Mobikwik, Airtel' },
];

const TESTIMONIALS = [
    { name: 'Priya Joshi', role: 'Interior Designer, Bangalore', text: 'Upgraded to Premium for unlimited predictions. Best ₹1,599 I spend each month. My project turnaround time halved.', plan: 'Premium', avatar: '👩‍🎨', rating: 5 },
    { name: 'Suresh Naidu', role: 'Production Manager, Mysore', text: 'Pro plan\'s Batch QC AI alone saves us ₹2–3 lakh per month in raw material waste. ROI is incredible.', plan: 'Pro', avatar: '⚙️', rating: 5 },
    { name: 'Rahul Mehta', role: 'Homeowner, Pune', text: 'Used the Free plan to pick colours for my entire home. 5 predictions was more than enough to nail every room!', plan: 'Free', avatar: '🏠', rating: 5 },
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
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setAvatarOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const initials = userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
    const dashPath = { user: '/user/dashboard', manufacturer: '/manufacturer/dashboard', brand: '/brand/dashboard', admin: '/admin/dashboard' }[userProfile?.role] || '/';

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            backdropFilter: 'blur(20px)',
            background: scrolled ? 'rgba(8,14,26,0.97)' : 'rgba(8,14,26,0.82)',
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
                        style={{ color: p === '/pricing' ? 'var(--accent)' : undefined }}>{l}</button>
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
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{userProfile?.role} · {userProfile?.subscription || 'free'}</div>
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
const Pricing = () => {
    const navigate = useNavigate();
    const { user, userProfile, updateProfile } = useAuth();
    const { showToast } = useToast();
    const [upgrading, setUpgrading] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);
    const currentPlan = userProfile?.subscription || 'free';

    const FW = { width: '100%', padding: '80px 0' };
    const INNER = { maxWidth: 1200, margin: '0 auto', padding: '0 48px' };

    // ── Razorpay Payment ──────────────────────────────────────────────────────
    const handleSelectPlan = async (plan) => {
        if (!user) { navigate('/register'); return; }
        if (plan.planKey === 'free') { showToast('Free plan — just sign up, no payment needed!', 'info'); return; }
        if (plan.planKey === currentPlan) { showToast('You are already on this plan.', 'info'); return; }

        setUpgrading(plan.planKey);
        const ok = await loadRazorpay();
        if (!ok) {
            showToast('Razorpay failed to load. Please check your internet connection.', 'error');
            setUpgrading(null); return;
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: plan.razorpayAmount,       // paise
            currency: 'INR',
            name: 'ChromaAI',
            description: `${plan.name} Plan — Monthly Subscription`,
            image: 'https://ui-avatars.com/api/?name=ChromaAI&background=F59E0B&color=000&bold=true&size=80',
            notes: { plan: plan.planKey, uid: user.uid },
            handler: async (response) => {
                try {
                    // 1. Set expiry 30 days from now
                    const expiry = new Date();
                    expiry.setDate(expiry.getDate() + 30);

                    // 2. Update Firestore user profile
                    await updateProfile(user.uid, {
                        subscription: plan.planKey,
                        subscriptionExpiry: expiry.toISOString(),
                    });

                    // 3. Record subscription in Firestore
                    await addDoc(collection(db, 'subscriptions'), {
                        uid: user.uid,
                        userName: userProfile?.name || '',
                        email: userProfile?.email || '',
                        role: userProfile?.role || 'user',
                        plan: plan.planKey,
                        amount: plan.priceINR,
                        currency: 'INR',
                        razorpay_payment_id: response.razorpay_payment_id,
                        status: 'active',
                        expiresAt: expiry.toISOString(),
                        createdAt: serverTimestamp(),
                    });

                    // 4. Send in-app notification
                    await addDoc(collection(db, `notifications/${user.uid}/items`), {
                        message: `🎉 Welcome to ${plan.name}! Your ChromaAI plan is now active. Enjoy unlimited access.`,
                        type: 'success',
                        read: false,
                        createdAt: serverTimestamp(),
                        link: `/${userProfile?.role || 'user'}/dashboard`,
                    });

                    // 5. Log activity
                    await addDoc(collection(db, 'activity_logs'), {
                        uid: user.uid,
                        userName: userProfile?.name,
                        role: userProfile?.role,
                        action: 'Plan upgraded',
                        details: `Upgraded to ${plan.name} plan — ₹${plan.priceINR}/month`,
                        createdAt: serverTimestamp(),
                    });

                    showToast(`🎉 Payment successful! Upgraded to ${plan.name}.`, 'success');
                    navigate(`/${userProfile?.role || 'user'}/dashboard`);
                } catch (err) {
                    showToast('Payment recorded, but profile sync failed. Please contact support with your payment ID: ' + response.razorpay_payment_id, 'error');
                }
                setUpgrading(null);
            },
            prefill: {
                name: userProfile?.name || '',
                email: userProfile?.email || '',
                contact: '',
            },
            theme: { color: '#F59E0B' },
            modal: {
                ondismiss: () => {
                    showToast('Payment cancelled. You can try again anytime.', 'info');
                    setUpgrading(null);
                },
            },
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                showToast('Payment failed. Please try a different payment method.', 'error');
                setUpgrading(null);
            });
            rzp.open();
        } catch {
            showToast('Unable to open Razorpay. Please try again.', 'error');
            setUpgrading(null);
        }
    };

    return (
        <div style={{ background: 'var(--bg-primary)', overflowX: 'hidden' }}>
            <PublicNav />
            <div style={{ height: 64 }} />

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <div style={{
                ...FW, padding: '100px 0 80px', position: 'relative',
                overflow: 'hidden', textAlign: 'center',
            }}>
                {/* Paint-domain bg */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    background: `
            radial-gradient(ellipse 800px 500px at 20% 50%, rgba(245,158,11,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 600px 500px at 80% 50%, rgba(139,92,246,0.09) 0%, transparent 55%),
            linear-gradient(160deg, #080E1A 0%, #0F172A 100%)
          `,
                }} />
                {/* Rainbow strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, zIndex: 2, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6,#EC4899)' }} />

                {/* Floating blobs */}
                {[
                    { top: '20%', left: '3%', w: 180, h: 150, c: 'rgba(245,158,11,0.07)', d: '0s' },
                    { top: '60%', left: '1%', w: 120, h: 110, c: 'rgba(16,185,129,0.06)', d: '1s' },
                    { top: '15%', right: '3%', w: 220, h: 180, c: 'rgba(139,92,246,0.07)', d: '0.5s' },
                    { top: '65%', right: '4%', w: 150, h: 130, c: 'rgba(245,158,11,0.06)', d: '1.5s' },
                ].map((b, i) => (
                    <div key={i} style={{
                        position: 'absolute', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 70%',
                        width: b.w, height: b.h, background: b.c,
                        top: b.top, left: b.left, right: b.right,
                        filter: 'blur(24px)', zIndex: 0,
                        animation: 'blobFloat 7s ease-in-out infinite alternate',
                        animationDelay: b.d,
                    }} />
                ))}

                <div style={{ ...INNER, position: 'relative', zIndex: 1 }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 20 }}>💳 Transparent Pricing · Pay in ₹ INR</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
                        Simple Plans,<br />
                        <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Powerful AI
                        </span>
                    </h1>
                    <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 28px', lineHeight: 1.9 }}>
                        Start free with 5 AI predictions forever. Upgrade when you need more power — paid securely in Indian Rupees via <strong style={{ color: '#0EA5E9' }}>Razorpay</strong>.
                    </p>

                    {/* Razorpay trust badge */}
                    <div style={{ display: 'inline-flex', gap: 16, alignItems: 'center', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 999, padding: '10px 24px', marginBottom: 24 }}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0EA5E9' }}>Secured by Razorpay</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PCI-DSS L1 · UPI · Cards · Net Banking · Wallets</div>
                        </div>
                    </div>

                    {/* Current plan badge */}
                    {user && currentPlan !== 'free' && (
                        <div style={{ display: 'block', marginBottom: 24 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '8px 20px', fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>
                                ✅ You're currently on the <strong style={{ textTransform: 'capitalize' }}>{currentPlan}</strong> plan
                            </div>
                        </div>
                    )}

                    {/* Paint colour strip decoration */}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                        {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#C27A57', '#8FAF8C', '#1E3A5F', '#F5E6C8'].map((hex, i) => (
                            <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: hex, border: '1px solid rgba(255,255,255,0.08)', boxShadow: `0 2px 8px ${hex}44`, transition: 'transform 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── PLAN CARDS ────────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' }}>
                        {PLANS.map(plan => {
                            const isCurrent = currentPlan === plan.planKey;
                            return (
                                <div key={plan.name} style={{
                                    background: plan.featured
                                        ? `linear-gradient(160deg, ${plan.accent}, var(--bg-card))`
                                        : 'var(--bg-card)',
                                    border: `2px solid ${plan.featured ? plan.color : 'var(--border)'}`,
                                    borderRadius: 20, padding: '36px 28px 28px',
                                    position: 'relative', display: 'flex', flexDirection: 'column',
                                    transform: plan.featured ? 'scale(1.03)' : 'none',
                                    boxShadow: plan.featured ? `0 0 40px ${plan.color}22` : 'none',
                                    transition: 'var(--transition)',
                                }}
                                    onMouseEnter={e => { if (!plan.featured) { e.currentTarget.style.borderColor = plan.color; e.currentTarget.style.transform = 'translateY(-6px)'; } }}
                                    onMouseLeave={e => { if (!plan.featured) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; } }}
                                >
                                    {plan.featured && (
                                        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#000', fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.15em', padding: '5px 16px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                                            ⭐ MOST POPULAR
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 999, padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--success)' }}>
                                            CURRENT
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: 42, marginBottom: 10 }}>{plan.icon}</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 4 }}>{plan.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{plan.tagline}</div>
                                    </div>

                                    {/* Price */}
                                    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.2rem', fontWeight: 700, color: plan.featured ? plan.color : 'var(--text-primary)', lineHeight: 1 }}>
                                                {plan.priceDisplay}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{plan.period}</div>
                                        {plan.planKey !== 'free' && (
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                                = ₹{Math.round(plan.priceINR / 30)}/day · Billed monthly
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                                        {plan.features.map(f => (
                                            <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                                                {f}
                                            </div>
                                        ))}
                                        {plan.notIncluded.map(f => (
                                            <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                                                <span style={{ flexShrink: 0 }}>✗</span>
                                                <span style={{ textDecoration: 'line-through' }}>{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={isCurrent || upgrading === plan.planKey}
                                        style={{
                                            width: '100%', padding: '14px', borderRadius: 10,
                                            border: plan.featured ? 'none' : `2px solid ${plan.color}`,
                                            background: plan.featured
                                                ? `linear-gradient(135deg, ${plan.color}, #FCD34D)`
                                                : isCurrent ? 'var(--bg-elevated)' : 'transparent',
                                            color: plan.featured ? '#000' : isCurrent ? 'var(--text-muted)' : plan.color,
                                            fontWeight: 700, fontSize: '0.95rem', cursor: isCurrent ? 'default' : 'pointer',
                                            transition: 'all 0.2s', letterSpacing: '0.02em',
                                        }}
                                        onMouseEnter={e => { if (!isCurrent && !plan.featured) { e.currentTarget.style.background = plan.color; e.currentTarget.style.color = '#000'; } }}
                                        onMouseLeave={e => { if (!isCurrent && !plan.featured) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = plan.color; } }}
                                    >
                                        {upgrading === plan.planKey
                                            ? '⏳ Opening Razorpay...'
                                            : isCurrent
                                                ? '✓ Current Plan'
                                                : plan.planKey === 'free'
                                                    ? '🚀 ' + plan.cta
                                                    : `💳 ${plan.cta} · ${plan.priceDisplay}/mo`}
                                    </button>

                                    {plan.planKey !== 'free' && !isCurrent && (
                                        <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            🔒 Secured via Razorpay · 7-day refund policy
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Reassurance row */}
                    <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40 }}>
                        {['✅ No credit card for Free plan', '✅ Instant activation after payment', '✅ Cancel anytime', '✅ 7-day refund policy', '✅ INR pricing · Razorpay'].map(t => (
                            <span key={t} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── PAYMENT METHODS ───────────────────────────────────────────── */}
            <div style={{ ...FW, padding: '60px 0', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div className="section-label">Payment</div>
                        <h2 className="section-title">Pay Your Way with Razorpay</h2>
                        <p className="section-subtitle">All major Indian payment methods accepted. Instant, secure, and encrypted.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                        {PAYMENT_METHODS.map(m => (
                            <div key={m.name} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: '28px 20px', textAlign: 'center',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0EA5E9'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <div style={{ fontSize: 40, marginBottom: 14 }}>{m.icon}</div>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>{m.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.detail}</div>
                            </div>
                        ))}
                    </div>

                    {/* Razorpay info bar */}
                    <div style={{
                        marginTop: 32, background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.2)',
                        borderRadius: 'var(--radius)', padding: '20px 28px',
                        display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '1.6rem' }}>🔒</span>
                        <div>
                            <div style={{ fontWeight: 700, color: '#0EA5E9', fontSize: '0.95rem' }}>Powered by Razorpay — India's Leading Payment Gateway</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>PCI-DSS Level 1 Certified · TLS 1.3 Encryption · RBI Compliant · Trusted by 8 million businesses</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FEATURE COMPARISON ────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label">Compare</div>
                        <h2 className="section-title">Full Feature Comparison</h2>
                        <p className="section-subtitle">See exactly what's included in each plan before making your decision.</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.82rem', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)', background: 'var(--bg-elevated)' }}>Feature</th>
                                    {PLANS.map(p => (
                                        <th key={p.name} style={{
                                            padding: '14px 20px', textAlign: 'center',
                                            fontSize: '0.88rem', fontWeight: 700,
                                            color: p.featured ? p.color : 'var(--text-primary)',
                                            borderBottom: `2px solid ${p.featured ? p.color : 'var(--border)'}`,
                                            background: p.featured ? `${p.accent}` : 'var(--bg-elevated)',
                                            minWidth: 140,
                                        }}>
                                            {p.icon} {p.name}
                                            {p.featured && <div style={{ fontSize: '0.65rem', color: p.color, fontWeight: 800, letterSpacing: '0.1em', marginTop: 2 }}>★ POPULAR</div>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {FEATURE_COMPARE.map((row, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px 20px', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.label}</td>
                                        {[row.free, row.premium, row.pro].map((val, j) => (
                                            <td key={j} style={{
                                                padding: '12px 20px', textAlign: 'center',
                                                fontSize: val === '❌' ? '1rem' : '0.82rem',
                                                fontWeight: val.startsWith('✅') ? 700 : 400,
                                                color: val === '❌' ? 'var(--danger)' : val.startsWith('✅') ? 'var(--success)' : 'var(--text-secondary)',
                                                background: j === 1 ? 'rgba(245,158,11,0.03)' : 'transparent',
                                            }}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                                {/* price row */}
                                <tr style={{ background: 'var(--bg-elevated)', borderTop: '2px solid var(--border)' }}>
                                    <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '0.875rem' }}>Monthly Price</td>
                                    {PLANS.map(p => (
                                        <td key={p.name} style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.3rem', color: p.featured ? p.color : 'var(--text-primary)' }}>{p.priceDisplay}</div>
                                            <button
                                                onClick={() => handleSelectPlan(p)}
                                                disabled={currentPlan === p.planKey || upgrading === p.planKey}
                                                style={{ marginTop: 8, padding: '6px 16px', borderRadius: 999, border: `1px solid ${p.color}`, background: p.featured ? p.color : 'transparent', color: p.featured ? '#000' : p.color, fontWeight: 600, fontSize: '0.72rem', cursor: currentPlan === p.planKey ? 'default' : 'pointer' }}
                                            >
                                                {currentPlan === p.planKey ? '✓ Current' : upgrading === p.planKey ? '⏳...' : p.planKey === 'free' ? 'Get Free' : `Pay ${p.priceDisplay}`}
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
                <div style={INNER}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label">Customer Stories</div>
                        <h2 className="section-title">Customers Love What They Pay For</h2>
                        <p className="section-subtitle">See why ChromaAI subscribers say it pays for itself within the first week.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {TESTIMONIALS.map((t, i) => {
                            const plan = PLANS.find(p => p.name === t.plan);
                            return (
                                <div key={i} style={{
                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)', padding: 28, display: 'flex', flexDirection: 'column',
                                    transition: 'var(--transition)',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                                >
                                    <div style={{ color: '#FCD34D', fontSize: '0.85rem', marginBottom: 10, letterSpacing: 2 }}>{'★'.repeat(t.rating)}</div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, flex: 1, marginBottom: 20 }}>❝{t.text}❞</p>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{t.avatar}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.role}</div>
                                        </div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, borderRadius: 999, padding: '4px 10px', background: plan ? `${plan.accent}` : 'var(--bg-elevated)', border: `1px solid ${plan ? plan.color + '44' : 'var(--border)'}`, color: plan ? plan.color : 'var(--text-muted)', flexShrink: 0 }}>
                                            {t.plan}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── FAQ ───────────────────────────────────────────────────────── */}
            <div style={{ ...FW, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 48px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label">FAQ</div>
                        <h2 className="section-title">Pricing Questions Answered</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {FAQS.map((f, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)',
                                border: `1px solid ${openFaq === i ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)', overflow: 'hidden', transition: 'border-color 0.2s',
                            }}>
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                                    width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                                    textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', gap: 12, color: 'var(--text-primary)',
                                    fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                                }}>
                                    {f.q}
                                    <span style={{ fontSize: '1.4rem', color: 'var(--accent)', flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
                                </button>
                                {openFaq === i && (
                                    <div style={{ padding: '0 20px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{f.a}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA BANNER ────────────────────────────────────────────────── */}
            <div style={{
                ...FW, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, #0F172A 0%, #1A1A2E 100%)',
                borderTop: '1px solid var(--border)',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(245,158,11,0.09) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6)' }} />
                <div style={{ ...INNER, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 20 }}>🎨 Start Your Free Plan Today</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>
                        Never Guess a Paint Colour Again —<br />
                        <span style={{ color: 'var(--accent)' }}>Start Free in 30 Seconds</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1rem', maxWidth: 500, margin: '0 auto 36px' }}>
                        5 AI predictions forever. No credit card. No commitment. Upgrade to Premium or Pro only when you're ready.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-lg" style={{ padding: '14px 36px', fontSize: '1rem' }}
                            onClick={() => !user ? navigate('/register') : handleSelectPlan(PLANS.find(p => p.planKey === 'premium'))}>
                            {!user ? '🚀 Create Free Account →' : '⭐ Upgrade to Premium →'}
                        </button>
                        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/contact')}>Talk to Sales</button>
                    </div>
                    <div style={{ marginTop: 24, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['🔒 PCI-DSS Secured', '🇮🇳 INR Pricing', '✅ 7-day refund', '⚡ Instant activation'].map(b => (
                            <span key={b} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FOOTER ────────────────────────────────────────────────────── */}
            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '28px 48px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                    {[['Home', '/'], ['About', '/about'], ['Why Us', '/why-us'], ['Contact', '/contact']].map(([l, p]) => (
                        <span key={l} style={{ cursor: 'pointer' }} onClick={() => navigate(p)}>{l}</span>
                    ))}
                </div>
                © 2025 ChromaAI · All rights reserved · Built in India 🇮🇳
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
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="scale(1.03)"] { transform: none !important; }
        }
        @media (max-width: 600px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
        </div>
    );
};

export default Pricing;
