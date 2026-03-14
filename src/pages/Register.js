// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

const ROLES = [
  { value: 'user', icon: '👤', label: 'Customer', desc: 'Predict colours for walls & spaces' },
  { value: 'manufacturer', icon: '🏭', label: 'Manufacturer', desc: 'Optimise batches & quality control' },
  { value: 'brand', icon: '🏷️', label: 'Brand Partner', desc: 'Run targeted ad campaigns' },
  { value: 'admin', icon: '🛡️', label: 'Admin', desc: 'Manage the platform' },
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await register(form.email, form.password, form.name, form.role);
      showToast(`🎉 Welcome, ${form.name}! Your account is ready.`, 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  // role highlights
  const roleAccent = { user: '#F59E0B', manufacturer: '#10B981', brand: '#3B82F6', admin: '#8B5CF6' };

  const featureList = [
    { icon: '🎨', text: 'Free plan – 5 AI predictions/month, no card needed' },
    { icon: '🤖', text: '3-model AI pipeline built for the paint industry' },
    { icon: '📊', text: 'Role-specific dashboard tailored to your workflow' },
    { icon: '🤝', text: 'Connect with 50+ partnered paint brands' },
  ];

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, color: '#F1F5F9', fontSize: '0.9rem',
    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Sora, sans-serif',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7,
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      background: '#080E1A',
      overflow: 'hidden',
    }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
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
        {/* Gradient glows */}
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)', top: -80, left: -80, zIndex: 0 }} />
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', bottom: -40, right: -40, zIndex: 0 }} />

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
            Join the future of<br />
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              paint intelligence.
            </span>
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.8, marginBottom: 36, maxWidth: 380 }}>
            Create your account and access AI-powered tools tailored for your role — whether you're a customer, manufacturer, or brand partner.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44 }}>
            {featureList.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, flexShrink: 0,
                }}>{f.icon}</div>
                <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Role preview chips */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Pick your role on the right →</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ROLES.map(r => (
                <div key={r.value} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px',
                  borderRadius: 999,
                  background: form.role === r.value ? `${roleAccent[r.value]}18` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${form.role === r.value ? `${roleAccent[r.value]}50` : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{r.icon}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: form.role === r.value ? roleAccent[r.value] : '#475569' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            {[['₹0', 'Free to Start'], ['97%', 'AI Accuracy'], ['50+', 'Brand Partners']].map(([v, l]) => (
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

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 56px',
        background: '#080E1A',
        position: 'relative',
        overflowY: 'auto',
      }}>
        {/* Subtle glow */}
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
              Create account
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Get started with ChromaAI — free forever</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 18,
              fontSize: '0.875rem', color: '#EF4444', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── Role selector ── */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>I am a…</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {ROLES.map(r => {
                const selected = form.role === r.value;
                const ac = roleAccent[r.value];
                return (
                  <div
                    key={r.value}
                    id={`role-${r.value}`}
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `2px solid ${selected ? ac : 'rgba(255,255,255,0.07)'}`,
                      background: selected ? `${ac}14` : '#111827',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      display: 'flex', alignItems: 'center', gap: 10,
                      boxShadow: selected ? `0 0 14px ${ac}22` : 'none',
                    }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = `${ac}55`; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: selected ? ac : '#F1F5F9' }}>{r.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#475569', lineHeight: 1.4, marginTop: 1 }}>{r.desc}</div>
                    </div>
                    {selected && (
                      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: ac, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#000', fontWeight: 800, flexShrink: 0 }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Full Name ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="Arjun Mehta"
              value={form.name}
              onChange={handleChange}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* ── Email ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email Address</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* ── Password ── */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ ...inputStyle, paddingRight: 48 }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
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

            {/* Password strength bar */}
            {form.password.length > 0 && (() => {
              const len = form.password.length;
              const pct = Math.min(len / 12, 1);
              const color = len < 6 ? '#EF4444' : len < 9 ? '#F59E0B' : '#10B981';
              const label = len < 6 ? 'Too short' : len < 9 ? 'Fair' : 'Strong';
              return (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 999, transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color, marginTop: 4, marginLeft: 2 }}>{label}</div>
                </div>
              );
            })()}
          </div>

          {/* ── Submit ── */}
          <button
            id="reg-submit"
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
              marginBottom: 20,
              fontFamily: 'Sora, sans-serif',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,158,11,0.5)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,158,11,0.35)'; }}
          >
            {loading ? '⏳ Creating account...' : 'Create Account →'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Sign in link */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#F59E0B', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', padding: 0, fontFamily: 'Sora, sans-serif' }}
            >
              Sign In →
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

          {/* Terms + Security note */}
          <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>🔒</span>
            <span style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.7 }}>
              Secured by <strong style={{ color: '#10B981' }}>Firebase Auth</strong>. By registering you agree to our{' '}
              <span style={{ color: '#F59E0B', cursor: 'pointer' }}>Terms of Service</span> and{' '}
              <span style={{ color: '#F59E0B', cursor: 'pointer' }}>Privacy Policy</span>.
            </span>
          </div>
        </div>
      </div>

      {/* ── Responsive ── */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="flex: 0 0 50%; display: flex; flex-direction: column; justify-content: center; padding: 48px 56px; position: relative; overflow: hidden"] {
            display: none !important;
          }
          div[style*="flex: 0 0 50%; display: flex; flex-direction: column; justify-content: center; align-items: center"] {
            flex: 0 0 100% !important;
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;