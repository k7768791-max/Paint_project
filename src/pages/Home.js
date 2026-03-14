// src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import SponsoredAdModal from '../components/common/SponsoredAdModal';

// ── Razorpay helper ───────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere';

// ── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Products', id: null, path: '/products' },
];

const FEATURES = [
  { icon: '🎨', title: 'AI Color Recommendation', desc: 'Predict the perfect paint color for any surface — wall, wood, iron — in seconds.' },
  { icon: '⚗️', title: 'Chemical Formulation', desc: 'Manufacturers predict exact color output from pigment & solvent ratios.' },
  { icon: '🏭', title: 'Quality Optimizer', desc: 'Maximize batch quality by analyzing temperature, mixing time, and composition.' },
  { icon: '📢', title: 'Brand Marketplace', desc: 'Brands reach customers at the moment of color recommendation.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Real-time dashboards for every role — user, manufacturer, brand, admin.' },
  { icon: '🔐', title: 'Role-Based Access', desc: 'Separate secure portals for users, manufacturers, brand partners and admins.' },
];

const HOW_STEPS = [
  { num: '01', icon: '📝', title: 'Create Account', desc: 'Register free in 30 seconds. Choose your role — user, manufacturer or brand partner.' },
  { num: '02', icon: '🧩', title: 'Enter Your Data', desc: 'Describe your surface, environment, and preferences. Or enter chemical formulations.' },
  { num: '03', icon: '🤖', title: 'AI Predicts', desc: 'Our 3-model AI pipeline analyzes 15+ parameters and delivers instant results.' },
  { num: '04', icon: '🎯', title: 'Get Results', desc: 'Receive color recommendations, product suggestions, quality scores, and more.' },
];

const AI_MODELS = [
  { icon: '🎨', label: 'Model 1', name: 'Color Recommender', accuracy: 94, uses: 'End users', desc: 'Recommends ideal paint color from surface + environment data.' },
  { icon: '🔬', label: 'Model 2', name: 'Chemical Predictor', accuracy: 89, uses: 'Manufacturers', desc: 'Predicts color output from pigment, solvent, and additive ratios.' },
  { icon: '⚗️', label: 'Model 3', name: 'Quality Optimizer', accuracy: 97, uses: 'Manufacturers', desc: 'Predicts viscosity, purity, quality score with improvement tips.' },
];

const TESTIMONIALS = [
  { name: 'Arjun Mehta', role: 'Interior Designer, Mumbai', text: 'ChromaAI nailed the exact shade for my client\'s outdoor villa. What used to take 3 days of sampling now takes 30 seconds!', avatar: '👨‍🎨', rating: 5 },
  { name: 'PaintCo Industries', role: 'Paint Manufacturer, Pune', text: 'Batch failures dropped by 40% in 2 months. The Quality Optimizer\'s recommendations are incredibly precise.', avatar: '🏭', rating: 5 },
  { name: 'ColourHouse Brands', role: 'Brand Partner, Delhi', text: 'Our ads now reach exactly the right customers at the moment they\'re choosing paint. CTR jumped 3x!', avatar: '🏷️', rating: 5 },
  { name: 'Priya Sharma', role: 'Homeowner, Bangalore', text: 'I was overwhelmed by paint choices. ChromaAI gave me the perfect colour with just a few answers. Totally free!', avatar: '🏠', rating: 5 },
];

const FAQS = [
  { q: 'Is ChromaAI free to use?', a: 'Yes! Our Free plan gives you 5 AI predictions per month at no cost, forever. Upgrade only when you need more.' },
  { q: 'How accurate are the AI predictions?', a: 'Model accuracy ranges from 89% to 97%. Our models are retrained monthly on real paint industry data.' },
  { q: 'Can manufacturers use ChromaAI?', a: 'Absolutely. Models 2 and 3 are built specifically for manufacturers — chemical formulation prediction and quality optimization.' },
  { q: 'How does Razorpay payment work?', a: 'Click any paid plan, complete payment via Razorpay (UPI, cards, netbanking). Your account upgrades instantly after payment.' },
  { q: 'Can brands advertise on ChromaAI?', a: 'Yes! Brand partners can submit targeted ads that appear to users when our AI recommends matching colors.' },
  { q: 'Is my data secure?', a: 'All data is encrypted and stored on Firebase with industry-standard security. Your prediction data is private.' },
];

const PLANS = [
  {
    name: 'Free', priceINR: 0, priceDisplay: '₹0', period: '/month',
    icon: '🪙', planKey: 'free', razorpayAmount: 0,
    features: ['5 predictions/month', 'Basic color suggestions', 'Community support'],
    notIncluded: ['Unlimited predictions', 'Advanced AI insights', 'API access'],
    featured: false,
  },
  {
    name: 'Premium', priceINR: 1599, priceDisplay: '₹1,599', period: '/month',
    icon: '⭐', planKey: 'premium', razorpayAmount: 159900, // paise
    features: ['Unlimited predictions', 'Full AI recommendations', 'Product marketplace', 'Sponsored products', 'Priority email support'],
    notIncluded: ['API access'],
    featured: true,
  },
  {
    name: 'Pro', priceINR: 3999, priceDisplay: '₹3,999', period: '/month',
    icon: '🚀', planKey: 'pro', razorpayAmount: 399900,
    features: ['Everything in Premium', 'API access', 'Advanced analytics', 'Batch quality monitoring', 'Dedicated account manager'],
    notIncluded: [],
    featured: false,
  },
];

const STATS = [
  { value: '3', label: 'AI Models', suffix: '' },
  { value: '97', label: 'Max Accuracy', suffix: '%' },
  { value: '500', label: 'Paint Products', suffix: '+' },
  { value: '50', label: 'Brand Partners', suffix: '+' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const { user, userProfile, logout, updateProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [approvedAds, setApprovedAds] = useState([]);
  const [adSlide, setAdSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [payLoading, setPayLoading] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const avatarRef = useRef(null);

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const dashPath = { user: '/user/dashboard', manufacturer: '/manufacturer/dashboard', brand: '/brand/dashboard', admin: '/admin/dashboard' }[userProfile?.role] || '/';
  const currentPlan = userProfile?.subscription || 'free';

  useEffect(() => {
    const q = query(collection(db, 'brand_ads'), where('status', '==', 'approved'));
    return onSnapshot(q, snap => setApprovedAds(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => { });
  }, []);

  useEffect(() => {
    if (approvedAds.length <= 3) return;
    const t = setInterval(() => setAdSlide(p => (p + 1) % Math.ceil(approvedAds.length / 3)), 4500);
    return () => clearInterval(t);
  }, [approvedAds.length]);

  useEffect(() => {
    const handler = e => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => { await logout(); setAvatarOpen(false); navigate('/'); };

  const handleAdClick = async ad => {
    try {
      const { doc, updateDoc, increment } = await import('firebase/firestore');
      await updateDoc(doc(db, 'brand_ads', ad.id), { clickCount: increment(1) });
    } catch { }
    window.open(ad.ctaUrl, '_blank');
  };

  // ── Razorpay Payment ──────────────────────────────────────────────────────
  const handlePayment = async (plan) => {
    if (!user) { navigate('/register'); return; }
    if (plan.planKey === 'free') return;
    if (plan.planKey === currentPlan) { alert('You are already on this plan.'); return; }

    setPayLoading(plan.planKey);
    const ok = await loadRazorpay();
    if (!ok) { alert('Razorpay failed to load. Check internet connection.'); setPayLoading(null); return; }

    const options = {
      key: RAZORPAY_KEY,
      amount: plan.razorpayAmount,
      currency: 'INR',
      name: 'ChromaAI',
      description: `${plan.name} Plan — Monthly Subscription`,
      image: 'https://ui-avatars.com/api/?name=ChromaAI&background=F59E0B&color=000&bold=true',
      handler: async (response) => {
        try {
          // Save subscription record
          await addDoc(collection(db, 'subscriptions'), {
            uid: user.uid,
            userName: userProfile?.name,
            email: userProfile?.email,
            plan: plan.planKey,
            amount: plan.priceINR,
            currency: 'INR',
            razorpay_payment_id: response.razorpay_payment_id,
            createdAt: serverTimestamp(),
          });
          // Update user profile
          const expiry = new Date();
          expiry.setMonth(expiry.getMonth() + 1);
          await updateProfile(user.uid, { subscription: plan.planKey, subscriptionExpiry: expiry.toISOString() });
          // Notification
          await addDoc(collection(db, `notifications/${user.uid}/items`), {
            message: `🎉 Upgraded to ${plan.name}! Enjoy unlimited ChromaAI access.`,
            type: 'success', read: false, createdAt: serverTimestamp(), link: dashPath,
          });
          alert(`✅ Payment successful! You are now on ${plan.name} plan.`);
          navigate(dashPath);
        } catch (err) {
          alert('Payment recorded but profile update failed. Contact support.');
        }
        setPayLoading(null);
      },
      prefill: { name: userProfile?.name || '', email: userProfile?.email || '' },
      theme: { color: '#F59E0B' },
      modal: { ondismiss: () => setPayLoading(null) },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert('Unable to open payment gateway. Try again.');
      setPayLoading(null);
    }
  };

  const visibleAds = approvedAds.slice(adSlide * 3, adSlide * 3 + 3);

  // ── Section styles ────────────────────────────────────────────────────────
  const S = {
    fullSection: { width: '100%', padding: '80px 0' },
    inner: { maxWidth: 1200, margin: '0 auto', padding: '0 40px' },
  };

  return (
    <div style={{ background: 'var(--bg-primary)', overflowX: 'hidden' }}>

      {/* ── SPONSORED AD MODAL (auto-shows approved ads as popup) ── */}
      <SponsoredAdModal />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        backdropFilter: 'blur(20px)',
        background: scrolled ? 'rgba(8,14,26,0.97)' : 'rgba(8,14,26,0.7)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => scrollTo('hero')}>
          <div className="brand-icon">🎨</div>
          <div className="brand-name">ChromaAI</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_LINKS.map(l => (
            l.path
              ? <button key={l.label} className="btn btn-ghost btn-sm" onClick={() => navigate(l.path)}>{l.label}</button>
              : <button key={l.id} className="btn btn-ghost btn-sm" onClick={() => scrollTo(l.id)}>{l.label}</button>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/about')}>About</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/contact')}>Contact</button>
          {(!user || userProfile?.role === 'manufacturer') && (
            <button className="btn btn-ghost btn-sm" style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)', border: '1px solid' }} onClick={() => navigate('/brand-partners')}>For Brands</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!user ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started Free</button>
            </>
          ) : (
            <div ref={avatarRef} style={{ position: 'relative' }}>
              <div className="avatar" onClick={() => setAvatarOpen(!avatarOpen)} style={{ cursor: 'pointer', width: 40, height: 40 }}>{initials}</div>
              {avatarOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', zIndex: 500, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{userProfile?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{userProfile?.role} · {currentPlan}</div>
                  </div>
                  {[['📊 Dashboard', () => { navigate(dashPath); setAvatarOpen(false); }], ['👤 Profile', () => { navigate('/profile'); setAvatarOpen(false); }]].map(([label, fn]) => (
                    <button key={label} onClick={fn} style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.target.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.target.style.background = 'none'}>{label}</button>
                  ))}
                  <button onClick={handleLogout} style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', borderTop: '1px solid var(--border)', textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--danger)' }}>🚪 Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="hero" style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', paddingTop: 64,
      }}>
        {/* Paint splash background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 800px 600px at 10% 30%, rgba(245,158,11,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 600px 500px at 90% 70%, rgba(59,130,246,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 500px 400px at 50% 10%, rgba(16,185,129,0.08) 0%, transparent 60%),
            linear-gradient(180deg, #080E1A 0%, #0F172A 100%)
          `,
        }} />
        {/* Floating paint blobs */}
        {[
          { top: '15%', left: '5%', size: 180, color: 'rgba(245,158,11,0.07)', delay: '0s' },
          { top: '60%', left: '2%', size: 120, color: 'rgba(16,185,129,0.07)', delay: '1s' },
          { top: '25%', right: '5%', size: 220, color: 'rgba(59,130,246,0.07)', delay: '0.5s' },
          { top: '70%', right: '8%', size: 150, color: 'rgba(245,158,11,0.06)', delay: '1.5s' },
          { top: '45%', left: '50%', size: 100, color: 'rgba(168,85,247,0.06)', delay: '2s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 70%',
            width: b.size, height: b.size, background: b.color,
            top: b.top, left: b.left, right: b.right,
            animation: `blobFloat 6s ease-in-out infinite alternate`,
            animationDelay: b.delay,
            filter: 'blur(20px)', zIndex: 0,
          }} />
        ))}
        {/* Colorful paint palette decorative strip */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4, zIndex: 2,
          background: 'linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6, #EC4899)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px', maxWidth: 900, margin: '0 auto' }}>
          <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 24 }}>
            ✨ India's First AI-Powered Paint Intelligence Platform
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
            Predict. Optimize.<br />
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Color Perfectly.
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.8 }}>
            The only platform connecting customers, paint manufacturers, and brands through 3 specialized AI models — from color recommendation to chemical quality optimization.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
            {!user ? (
              <>
                <button className="btn btn-primary btn-lg" style={{ fontSize: '1rem', padding: '14px 32px' }} onClick={() => navigate('/register')}>
                  🚀 Start Free — No Card Needed
                </button>
                <button className="btn btn-ghost btn-lg" style={{ fontSize: '1rem' }} onClick={() => navigate('/login')}>Sign In</button>
              </>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => navigate(dashPath)}>📊 Go to My Dashboard →</button>
                <button className="btn btn-ghost btn-lg" onClick={() => scrollTo('pricing')}>View Plans</button>
              </>
            )}
          </div>

          {/* Paint swatch row */}
          {/* <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
            {[
              ['Chalk White', '#FFFFFF'], ['Cement Grey', '#9CA3AF'], ['Terracotta', '#C27A57'],
              ['Sage Green', '#8FAF8C'], ['Navy Blue', '#1E3A5F'], ['Charcoal', '#374151'],
              ['Warm Beige', '#F5E6C8'], ['Olive', '#6B7C45'],
            ].map(([name, hex]) => (
              <div key={name} title={name} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: hex,
                  border: '2px solid rgba(255,255,255,0.1)',
                  boxShadow: `0 4px 12px ${hex}55`,
                  transition: 'transform 0.2s',
                  cursor: 'default',
                }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'} />
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{name}</span>
              </div>
            ))}
          </div> */}

          {/* Stat counters */}
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {s.value}{s.suffix}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div id="features" style={{ ...S.fullSection, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">What We Offer</div>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">From color selection to manufacturing excellence — all in one intelligent platform.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 28, transition: 'var(--transition)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--accent-glow)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAINT DOMAIN VISUAL SECTION ── */}
      <div style={{ ...S.fullSection, background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 80% at 50% 50%, rgba(245,158,11,0.04) 0%, transparent 70%)' }} />
        <div style={{ ...S.inner, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div className="section-label">Our Domain</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>
                Built for the<br /><span style={{ color: 'var(--accent)' }}>Paint Industry</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 24, fontSize: '0.95rem' }}>
                ChromaAI is purpose-built for India's ₹60,000+ crore paint industry. Our AI models are trained on real paint formulation data, covering 500+ colors, 5 surface types, and 4 environment conditions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Trained on 10,000+ real formulation records', 'Covers exterior & interior paints', 'Supports chemical QC for manufacturing', 'Color families: neutral, warm, cool, and earth tones'].map(point => (
                  <div key={point} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--success)', fontSize: '1rem' }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Visual: color palette grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                '#FFFFFF', '#F5E6C8', '#FEFCE8', '#FDE68A',
                '#9CA3AF', '#6B7280', '#374151', '#1F2937',
                '#93C5FD', '#1E3A5F', '#8FAF8C', '#6B7C45',
                '#C27A57', '#B45309', '#EF4444', '#111827',
                '#FCA5A5', '#10B981', '#3B82F6', '#8B5CF6',
              ].map((hex, i) => (
                <div key={i} style={{
                  height: 60, borderRadius: 8, background: hex,
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = `0 8px 20px ${hex}66`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how" style={{ ...S.fullSection, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Process</div>
            <h2 className="section-title">How ChromaAI Works</h2>
            <p className="section-subtitle">4 simple steps from sign-up to perfect paint recommendations.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative' }}>
            {/* connector line */}
            <div style={{ position: 'absolute', top: 40, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.3 }} />
            {HOW_STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--bg-card)', border: '2px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, margin: '0 auto 20px',
                  boxShadow: '0 0 20px rgba(245,158,11,0.2)',
                }}>{s.icon}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI MODELS ── */}
      <div style={{ ...S.fullSection, background: 'var(--bg-primary)' }}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Technology</div>
            <h2 className="section-title">3 Specialized AI Models</h2>
            <p className="section-subtitle">Each model is purpose-built for a different stage of the paint lifecycle.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {AI_MODELS.map((m, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 32, textAlign: 'center',
                transition: 'var(--transition)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{m.icon}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{m.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>{m.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>For {m.uses}</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>{m.accuracy}% accurate</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${m.accuracy}%`, background: m.accuracy >= 95 ? 'var(--success)' : 'var(--accent)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ ...S.fullSection, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">Loved by Our Community</h2>
            <p className="section-subtitle">Real results from designers, manufacturers, and homeowners across India.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>
                <div style={{ color: 'var(--accent)', fontSize: '1.6rem', marginBottom: 14 }}>❝</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#FCD34D', fontSize: '0.85rem' }}>
                    {'★'.repeat(t.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(!user || userProfile?.role === 'manufacturer') && (
        <>
          {/* ── SHOP PRODUCTS CTA ── */}
          <div style={{ ...S.fullSection, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
            <div style={S.inner}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(59,130,246,0.06))',
                border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20,
                padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(245,158,11,0.04) 0%, transparent 70%)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="section-label" style={{ display: 'inline-flex', marginBottom: 16 }}>🛍️ Paint Marketplace</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>
                    Browse 500+ Premium Paint Products
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Shop paints from India's top brands — Asian Paints, Berger, Dulux, Nerolac & more. Buy with geo-location delivery tracking.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')} style={{ padding: '13px 32px' }}>
                      🛒 Shop Now →
                    </button>
                    <button className="btn btn-ghost btn-lg" onClick={() => navigate('/brand-partners')}>
                      🏷️ List Your Brand
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PRICING ── */}
      <div id="pricing" style={{ ...S.fullSection, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Pricing</div>
            <h2 className="section-title">Simple, Transparent Plans</h2>
            <p className="section-subtitle">All prices in Indian Rupees. Pay via UPI, Cards, or Netbanking through Razorpay.</p>
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginTop: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>🔒 Powered by</span>
              <span style={{ fontWeight: 700, color: '#0EA5E9' }}>Razorpay</span>
              <span>— Secure Indian Payments</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            {PLANS.map(plan => {
              const isCurrent = currentPlan === plan.planKey;
              return (
                <div key={plan.name} style={{
                  background: plan.featured ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))' : 'var(--bg-card)',
                  border: `2px solid ${plan.featured ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 16, padding: '32px 28px', position: 'relative', textAlign: 'center',
                  transform: plan.featured ? 'scale(1.04)' : 'none',
                }}>
                  {plan.featured && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', padding: '4px 14px', borderRadius: 999 }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{plan.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 700, color: plan.featured ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1 }}>{plan.priceDisplay}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 28 }}>{plan.period}</div>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, textAlign: 'left' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                    {plan.notIncluded.map(f => (
                      <li key={f} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                        <span style={{ flexShrink: 0 }}>✗</span><span style={{ textDecoration: 'line-through' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`btn btn-full ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '12px', fontSize: '0.9rem', cursor: isCurrent ? 'default' : 'pointer' }}
                    disabled={isCurrent || payLoading === plan.planKey}
                    onClick={() => plan.planKey === 'free' ? navigate('/register') : handlePayment(plan)}
                  >
                    {payLoading === plan.planKey ? '⏳ Opening Razorpay...' :
                      isCurrent ? '✓ Current Plan' :
                        plan.planKey === 'free' ? 'Start Free →' : `Pay ₹${plan.priceINR.toLocaleString('en-IN')} →`}
                  </button>
                  {plan.featured && !isCurrent && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
                      UPI · Cards · Net Banking · Wallets
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" style={{ ...S.fullSection, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ ...S.inner, maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: `1px solid ${openFaq === i ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>
                  {f.q}
                  <span style={{ fontSize: '1.2rem', color: 'var(--accent)', flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div style={{
        ...S.fullSection, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F172A 0%, #1A1A2E 100%)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6)' }} />
        <div style={{ ...S.inner, position: 'relative', textAlign: 'center' }}>
          <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 24 }}>🚀 Start Today — No Credit Card Needed</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>
            Ready to Color Your World<br />with <span style={{ color: 'var(--accent)' }}>AI Precision?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1rem', maxWidth: 500, margin: '0 auto 36px' }}>
            Join 1,000+ designers, manufacturers, and brands already using ChromaAI to transform their paint workflows.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" style={{ padding: '14px 36px', fontSize: '1rem' }} onClick={() => navigate('/register')}>
              Create Free Account →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => scrollTo('pricing')}>View Pricing</button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '60px 40px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className="brand-icon" style={{ width: 32, height: 32, fontSize: 14 }}>🎨</div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>ChromaAI</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 280 }}>
                India's AI-powered paint intelligence platform connecting users, manufacturers, and brands through smart color technology.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {['🔒 Razorpay Secured', '🔥 Firebase Backed'].map(tag => (
                  <span key={tag} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 999, padding: '3px 10px' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: '0.875rem' }}>Platform</div>
              {[['Home', '/'], ['About', '/about'], ['Why Us', '/why-us'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([l, p]) => (
                <button key={l} onClick={() => navigate(p)} style={{ display: 'block', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', marginBottom: 10, textAlign: 'left', padding: 0 }}>{l}</button>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: '0.875rem' }}>Roles</div>
              {[['For Users', '/register'], ['For Manufacturers', '/register'], ['For Brands', '/register'], ['Admin Portal', '/login']].map(([l, p]) => (
                <button key={l} onClick={() => navigate(p)} style={{ display: 'block', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', marginBottom: 10, textAlign: 'left', padding: 0 }}>{l}</button>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: '0.875rem' }}>Contact</div>
              {[['📧 hello@chromaai.in', null], ['📞 +91 98765 43210', null], ['📍 Koramangala, Bangalore', null], ['🕐 Mon–Sat 9AM–6PM IST', null]].map(([l]) => (
                <div key={l} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>{l}</div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>© 2025 ChromaAI. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(l => (
                <span key={l} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blobFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, -20px) scale(1.1); }
        }
        @media (max-width: 900px) {
          .home-nav-center { display: none !important; }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: repeat(2"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 2fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;