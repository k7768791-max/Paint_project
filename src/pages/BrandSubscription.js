// src/pages/BrandSubscription.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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

const BRAND_PLANS = [
  {
    name: 'Brand Starter',
    icon: '🌱',
    priceINR: 4999,
    priceDisplay: '₹4,999',
    period: '/month',
    planKey: 'brand_starter',
    razorpayAmount: 499900,
    color: '#3B82F6',
    features: [
      '2 Active Ad Campaigns',
      'Up to 10 Products Listed',
      'Ad click & impression analytics',
      'Basic dashboard access',
      'Email support',
      '1 Brand pincode zone',
    ],
    notIncluded: ['Priority ad placement', 'Advanced analytics', 'Dedicated manager'],
    featured: false,
  },
  {
    name: 'Brand Pro',
    icon: '🚀',
    priceINR: 12999,
    priceDisplay: '₹12,999',
    period: '/month',
    planKey: 'brand_pro',
    razorpayAmount: 1299900,
    color: '#F59E0B',
    features: [
      '10 Active Ad Campaigns',
      'Unlimited Products',
      'Pop-up modal ad placement',
      'Full analytics dashboard',
      'Real-time order tracking',
      'Geo-location delivery zones',
      'Priority admin support',
      '5 Brand pincode zones',
    ],
    notIncluded: ['White-label exports'],
    featured: true,
  },
  {
    name: 'Brand Enterprise',
    icon: '👑',
    priceINR: 29999,
    priceDisplay: '₹29,999',
    period: '/month',
    planKey: 'brand_enterprise',
    razorpayAmount: 2999900,
    color: '#8B5CF6',
    features: [
      'Unlimited Ad Campaigns',
      'Unlimited Products',
      'Priority ad placement (Top slot)',
      'Advanced analytics & exports',
      'Dedicated account manager',
      'Custom delivery zones (PAN India)',
      'API access for inventory sync',
      'White-label analytics reports',
      'SLA: 24-hour support response',
    ],
    notIncluded: [],
    featured: false,
  },
];

const BrandSubscription = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateProfile } = useAuth();
  const [payLoading, setPayLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const currentPlan = userProfile?.brandSubscription || null;

  const handlePayment = async (plan) => {
    if (!user) { navigate('/register'); return; }

    setPayLoading(plan.planKey);
    const ok = await loadRazorpay();
    if (!ok) { alert('Razorpay failed to load.'); setPayLoading(null); return; }

    const amount = billingCycle === 'yearly'
      ? Math.round(plan.razorpayAmount * 12 * 0.8)
      : plan.razorpayAmount;

    const options = {
      key: RAZORPAY_KEY,
      amount,
      currency: 'INR',
      name: 'ChromaAI Brand Partnership',
      description: `${plan.name} — ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Plan`,
      image: 'https://ui-avatars.com/api/?name=ChromaAI&background=F59E0B&color=000&bold=true',
      handler: async (response) => {
        try {
          const expiry = new Date();
          expiry.setMonth(expiry.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

          await addDoc(collection(db, 'subscriptions'), {
            uid: user.uid,
            userName: userProfile?.name,
            email: userProfile?.email,
            plan: plan.planKey,
            planName: plan.name,
            amount: billingCycle === 'yearly' ? Math.round(plan.priceINR * 12 * 0.8) : plan.priceINR,
            currency: 'INR',
            cycle: billingCycle,
            type: 'brand',
            razorpay_payment_id: response.razorpay_payment_id,
            createdAt: serverTimestamp(),
          });

          await updateProfile(user.uid, {
            brandSubscription: plan.planKey,
            brandSubscriptionExpiry: expiry.toISOString(),
            brandPlanName: plan.name,
          });

          await addDoc(collection(db, `notifications/${user.uid}/items`), {
            message: `🎉 You're now on ${plan.name}! Start adding products and ads.`,
            type: 'success', read: false, createdAt: serverTimestamp(), link: '/brand/dashboard',
          });

          alert(`✅ Successfully subscribed to ${plan.name}!`);
          navigate('/brand/dashboard');
        } catch {
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
      alert('Unable to open Razorpay. Try again.');
      setPayLoading(null);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,14,26,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="brand-icon">🎨</div>
          <div className="brand-name">ChromaAI</div>
          <span style={{ marginLeft: 8, fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 8px', borderRadius: 999 }}>
            Brand Partner Hub
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/brand/dashboard')}>My Dashboard →</button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Register as Brand</button>
            </>
          )}
        </div>
      </nav>

      <div style={{ height: 4, background: 'linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6, #EC4899)' }} />

      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '80px 40px 60px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 999, padding: '6px 18px', marginBottom: 24,
          fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700,
        }}>
          🏷️ Brand Partner Program
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: 16, lineHeight: 1.15 }}>
          Reach Customers at the <br />
          <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Moment of Decision
          </span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.8 }}>
          List your paint products on ChromaAI and showcase them to thousands of users actively looking for paint recommendations. Get real-time analytics, geo-targeted delivery, and premium ad placement.
        </p>

        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {[
            { value: '50K+', label: 'Monthly Active Users' },
            { value: '3x', label: 'Avg CTR Boost' },
            { value: '500+', label: 'Paint Products Listed' },
            { value: '₹60K Cr', label: 'Paint Market Size' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'inline-flex', background: 'var(--bg-card)', borderRadius: 999, border: '1px solid var(--border)', padding: 4, gap: 4, marginBottom: 56 }}>
          {['monthly', 'yearly'].map(cycle => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              style={{
                padding: '8px 24px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: billingCycle === cycle ? 'var(--accent)' : 'transparent',
                color: billingCycle === cycle ? '#000' : 'var(--text-secondary)',
                fontWeight: billingCycle === cycle ? 700 : 500, fontSize: '0.875rem',
                transition: 'all 0.2s',
              }}
            >
              {cycle === 'yearly' ? '📅 Yearly (Save 20%)' : '🗓️ Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {BRAND_PLANS.map(plan => {
          const isCurrent = currentPlan === plan.planKey;
          const yearlyPrice = Math.round(plan.priceINR * 12 * 0.8);
          const originalYearly = plan.priceINR * 12;

          return (
            <div key={plan.name} style={{
              background: plan.featured ? `linear-gradient(135deg, ${plan.color}12, ${plan.color}06)` : 'var(--bg-card)',
              border: `2px solid ${plan.featured ? plan.color : 'var(--border)'}`,
              borderRadius: 20, padding: '36px 28px', position: 'relative', textAlign: 'center',
              transform: plan.featured ? 'scale(1.04)' : 'none',
              boxShadow: plan.featured ? `0 20px 60px ${plan.color}20` : 'none',
            }}>
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#fff', fontWeight: 800, fontSize: '0.72rem',
                  letterSpacing: '0.1em', padding: '5px 18px', borderRadius: 999,
                }}>⭐ MOST POPULAR</div>
              )}
              <div style={{ fontSize: 44, marginBottom: 14 }}>{plan.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: plan.color }}>
                  {billingCycle === 'yearly' ? `₹${yearlyPrice.toLocaleString('en-IN')}` : plan.priceDisplay}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 4 }}>
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <div style={{ marginBottom: 20 }}>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    ₹{originalYearly.toLocaleString('en-IN')}
                  </span>
                  <span style={{ marginLeft: 8, color: '#10B981', fontWeight: 700, fontSize: '0.82rem' }}>
                    Save ₹{(originalYearly - yearlyPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, textAlign: 'left' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: plan.color, flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                    <span style={{ flexShrink: 0 }}>✗</span><span style={{ textDecoration: 'line-through' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => isCurrent ? null : handlePayment(plan)}
                disabled={isCurrent || payLoading === plan.planKey}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: isCurrent ? 'var(--bg-elevated)' : plan.featured ? plan.color : `${plan.color}25`,
                  color: isCurrent ? 'var(--text-muted)' : plan.featured ? '#fff' : plan.color,
                  fontWeight: 700, fontSize: '0.95rem',
                  cursor: isCurrent || payLoading === plan.planKey ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {payLoading === plan.planKey ? '⏳ Opening Razorpay...' :
                  isCurrent ? '✓ Current Plan' :
                    `Get Started →`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Benefits */}
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Why Brand with ChromaAI?</div>
            <h2 className="section-title">Built for Paint Brands</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🎯', title: 'Intent-Based Targeting', desc: 'Ads reach people actively looking for paint, not random browsing.' },
              { icon: '📡', title: 'Geo-Location Delivery', desc: 'Set your base pincode. Delivery time estimated automatically for every customer.' },
              { icon: '📊', title: 'Real-Time Analytics', desc: 'Track clicks, views, sales, and revenue live in your brand dashboard.' },
              { icon: '🪟', title: 'Pop-Up Ad Placement', desc: 'Premium popup ads with 3x higher CTR than standard banner ads.' },
              { icon: '✅', title: 'Admin Quality Control', desc: 'Products verified by admin team — only quality brands appear to users.' },
              { icon: '📦', title: 'Product Inventory', desc: 'Manage catalog, pricing, stock, and discounts from your dashboard.' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSubscription;
