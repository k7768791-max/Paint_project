// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      showToast('Welcome back! Signed in successfully.', 'success');
      navigate('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  const features = [
    { icon: '🎨', text: 'AI-powered colour recommendations' },
    { icon: '⚗️', text: 'Chemical property prediction' },
    { icon: '🏭', text: 'Manufacturing quality optimizer' },
    { icon: '📢', text: 'Brand marketplace & subscriptions' },
  ];

  const paintSwatches = ['#FFFFFF', '#F5E6C8', '#9CA3AF', '#C27A57', '#8FAF8C', '#1E3A5F', '#374151', '#6B7C45'];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      background: '#080E1A',
      overflow: 'hidden',
    }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(150deg, #0F172A 0%, #080E1A 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Paint-domain gradient glows */}
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)', top: -80, left: -80, zIndex: 0 }} />
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', bottom: -40, right: -40, zIndex: 0 }} />

        {/* Rainbow top accent stripe */}
        {/* <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6)', zIndex: 2 }} /> */}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 0 16px rgba(245,158,11,0.4)',
            }}>🎨</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>ChromaAI</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}>
            Paint smarter<br />
            with{' '}
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI precision.
            </span>
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.8, marginBottom: 36, maxWidth: 380 }}>
            The platform where chemistry meets creativity. Predict colours, optimise production, and connect with top paint brands.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44 }}>
            {features.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>{f.icon}</div>
                <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Paint swatches decoration */}
          {/* <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {paintSwatches.map((hex, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: 8,
                background: hex,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: `0 2px 8px ${hex}33`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${hex}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 2px 8px ${hex}33`; }} />
            ))}
          </div> */}

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            {[['3', 'AI Models'], ['97%', 'Accuracy'], ['500+', 'Products']].map(([v, l]) => (
              <div key={l} style={{
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)',
                borderRadius: 999, padding: '6px 16px', textAlign: 'center',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F59E0B' }}>{v}</div>
                <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 56px',
        background: '#080E1A',
        position: 'relative',
      }}>
        {/* Subtle glow behind form */}
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>

          {/* Form header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Sign in to your ChromaAI account to continue</p>
          </div>

          {/* Error alert */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontSize: '0.875rem', color: '#EF4444', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Email field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={{
                width: '100%', padding: '14px 16px',
                background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, color: '#F1F5F9', fontSize: '0.9rem',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', padding: '14px 48px 14px 16px',
                  background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, color: '#F1F5F9', fontSize: '0.9rem',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '1rem', color: '#475569', padding: 4,
                }}
                title={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            id="login-submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? '#D97706' : 'linear-gradient(135deg, #F59E0B, #D97706)',
              border: 'none', borderRadius: 10,
              color: '#000', fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.02em',
              boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
              marginBottom: 24,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,158,11,0.5)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,158,11,0.35)'; }}
          >
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Register redirect */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Don't have an account? </span>
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'none', border: 'none', color: '#F59E0B', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', padding: 0, fontFamily: 'Sora, sans-serif' }}
            >
              Create one →
            </button>
          </div>

          {/* Back to home */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Sora, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              ← Back to home
            </button>
          </div>

          {/* Security note */}
          <div style={{ marginTop: 32, padding: '14px 16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔒</span>
            <span style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.6 }}>
              Secured by <strong style={{ color: '#10B981' }}>Firebase Auth</strong>. We never store your password in plain text.
            </span>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="flex: 0 0 50%"] {
            flex: 0 0 100% !important;
          }
          div[style*="borderRight"] {
            display: none !important;
          }
          div[style*="flex: 0 0 50%; display: flex; flex-direction: column; justify-content: center; align-items: center"] {
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;