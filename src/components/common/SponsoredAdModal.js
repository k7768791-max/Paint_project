// src/components/common/SponsoredAdModal.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';

const SponsoredAdModal = () => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'brand_ads'), where('status', '==', 'approved'));
    return onSnapshot(q, snap => {
      const approved = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAds(approved);
    }, () => { });
  }, []);

  useEffect(() => {
    // Show popup 3 seconds after page load
    if (ads.length === 0 || dismissed) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [ads.length, dismissed]);

  useEffect(() => {
    // Auto-rotate among ads every 6 seconds
    if (!visible || ads.length <= 1) return;
    const t = setInterval(() => {
      setCurrentIndex(i => (i + 1) % ads.length);
      setImgLoaded(false);
    }, 6000);
    return () => clearInterval(t);
  }, [visible, ads.length]);

  if (!visible || ads.length === 0) return null;

  const ad = ads[currentIndex];

  const handleClose = () => {
    setVisible(false);
    setDismissed(true);
  };

  const handleAdClick = async () => {
    try {
      await updateDoc(doc(db, 'brand_ads', ad.id), { clickCount: increment(1) });
    } catch { }
    window.open(ad.ctaUrl || '#', '_blank');
    handleClose();
  };

  const placeholderColors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
  ];
  const placeholderColor = placeholderColors[currentIndex % placeholderColors.length];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: 'min(520px, 92vw)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.15)',
        animation: 'slideUpModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>

        {/* Rainbow top bar */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6, #EC4899)',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 10px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
              color: '#F59E0B', background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase',
            }}>Sponsored</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {ad.brandName}
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 16,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >×</button>
        </div>

        {/* Ad Image */}
        <div style={{
          width: '100%', height: 220, position: 'relative', overflow: 'hidden',
          background: placeholderColor,
        }}>
          {ad.imageUrl ? (
            <>
              {!imgLoaded && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: placeholderColor,
                }}>
                  <div style={{
                    width: 36, height: 36, border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                </div>
              )}
              <img
                src={ad.imageUrl}
                alt={ad.title}
                onLoad={() => setImgLoaded(true)}
                onError={e => { e.target.style.display = 'none'; setImgLoaded(true); }}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
              />
            </>
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 8,
            }}>
              <div style={{ fontSize: 52 }}>🎨</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.9rem' }}>
                {ad.brandName}
              </div>
            </div>
          )}

          {/* Gradient overlay bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
          }} />
        </div>

        {/* Ad Content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <h3 style={{
            fontSize: '1.2rem', fontWeight: 700, marginBottom: 8,
            color: 'var(--text-primary)', lineHeight: 1.3,
          }}>{ad.title}</h3>
          <p style={{
            fontSize: '0.875rem', color: 'var(--text-secondary)',
            lineHeight: 1.7, marginBottom: 20,
          }}>
            {ad.description?.slice(0, 160)}{ad.description?.length > 160 ? '...' : ''}
          </p>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={handleAdClick}
              style={{
                flex: 1, padding: '12px 20px',
                background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                color: '#000', border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,158,11,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,158,11,0.35)'; }}
            >
              {ad.ctaText || 'Learn More'} →
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', borderRadius: 10,
                cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            >
              Skip
            </button>
          </div>

          {/* Ad indicators */}
          {ads.length > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIndex(i); setImgLoaded(false); }}
                  style={{
                    width: i === currentIndex ? 20 : 8, height: 8,
                    borderRadius: 4, border: 'none', cursor: 'pointer',
                    background: i === currentIndex ? 'var(--accent)' : 'var(--bg-elevated)',
                    transition: 'all 0.3s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default SponsoredAdModal;
