// src/pages/OrdersPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

// Pincode distance-based delivery logic
const estimateDelivery = (userPincode, brandPincode) => {
  if (!userPincode || !brandPincode) return null;
  const diff = Math.abs(parseInt(userPincode) - parseInt(brandPincode));
  if (diff < 10000) return { days: 2, label: '1–2 Days', zone: 'Local', color: '#10B981' };
  if (diff < 50000) return { days: 4, label: '3–4 Days', zone: 'Regional', color: '#3B82F6' };
  if (diff < 200000) return { days: 6, label: '5–6 Days', zone: 'National', color: '#F59E0B' };
  return { days: 8, label: '7–8 Days', zone: 'Pan India', color: '#8B5CF6' };
};

const getDaysSinceOrder = (createdAt) => {
  if (!createdAt?.seconds) return 0;
  const ms = Date.now() - createdAt.seconds * 1000;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const getStatusIndex = (status) => {
  const norm = (status || 'confirmed').toLowerCase();
  if (norm === 'delivered') return 4;
  if (norm === 'out for delivery') return 3;
  if (norm === 'in transit' || norm === 'shipped') return 2;
  if (norm === 'processing') return 1;
  return 0; // confirmed
};

const TRACK_STEPS = [
  { label: 'Order Placed', icon: '📦', desc: 'Your order has been confirmed' },
  { label: 'Processing', icon: '⚙️', desc: 'Warehouse is preparing your order' },
  { label: 'Shipped', icon: '🚚', desc: 'On the way to your city' },
  { label: 'Out for Delivery', icon: '🛵', desc: 'Delivery partner is heading to you' },
  { label: 'Delivered', icon: '✅', desc: 'Package delivered successfully!' },
];

const statusColor = {
  confirmed: '#3B82F6',
  processing: '#F59E0B',
  shipped: '#8B5CF6',
  out_for_delivery: '#EC4899',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    return onSnapshot(q, snap => {
      const ords = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(ords);
      setLoading(false);
    }, () => setLoading(false));
  }, [user?.uid]);

  const getGeoLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setGeoLoading(false);
        showToast('Location updated! Delivery estimates refreshed.', 'success');
      },
      err => {
        setGeoLoading(false);
        showToast('Could not get location. Using pincode instead.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatExpectedDate = (iso) => {
    if (!iso) return 'Computing...';
    const d = new Date(iso);
    const today = new Date();
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Today or Tomorrow';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  if (!user) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔐</div>
          <h2 style={{ marginBottom: 12 }}>Sign in to view orders</h2>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Orders" />
        <div className="page-content">

          {/* Header */}
          <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="page-title">📦 My Orders</h1>
              <p className="page-subtitle">Track all your ChromaAI paint deliveries in real time</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {userLocation && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem',
                  color: '#10B981', background: 'rgba(16,185,129,0.1)', borderRadius: 8, padding: '6px 12px',
                  border: '1px solid rgba(16,185,129,0.3)',
                }}>
                  📍 Location Active ({userLocation.accuracy}m accuracy)
                </div>
              )}
              <button
                className="btn btn-secondary btn-sm"
                onClick={getGeoLocation}
                disabled={geoLoading}
              >
                {geoLoading ? '⏳ Detecting...' : '📡 Enable Geo-Location'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/products')}>
                + Shop More
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
              <h3 style={{ marginBottom: 8 }}>No orders yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                Browse our paint products and make your first purchase!
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/products')}>
                Browse Products →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map(order => {
                const daysSince = getDaysSinceOrder(order.createdAt);
                const currentStep = getStatusIndex(order.status);
                const delivery = estimateDelivery(order.userPincode, order.brandPincode);
                const isExpanded = expandedOrder === order.id;

                return (
                  <div
                    key={order.id}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Order Header */}
                    <div
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      style={{
                        padding: '18px 24px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: 16, flexWrap: 'wrap',
                      }}
                    >
                      {/* Product Color swatch */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      }}>🎨</div>

                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                          {order.productTitle}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span>🏷️ {order.brandName}</span>
                          <span>📅 {formatDate(order.createdAt?.toDate?.()?.toISOString() || new Date(order.createdAt?.seconds * 1000).toISOString())}</span>
                          <span style={{ color: delivery?.color || '#F59E0B' }}>🚚 {delivery?.zone || order.deliveryZone}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
                            ₹{order.price?.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {order.discount > 0 && `Saved ₹${(order.originalPrice - order.price)?.toLocaleString('en-IN')}`}
                          </div>
                        </div>

                        <div>
                          <div style={{
                            padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                            background: `${statusColor[order.status] || '#F59E0B'}20`,
                            color: statusColor[order.status] || '#F59E0B',
                            border: `1px solid ${statusColor[order.status] || '#F59E0B'}40`,
                            textTransform: 'capitalize',
                          }}>
                            {TRACK_STEPS[currentStep]?.label || order.status}
                          </div>
                        </div>

                        <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>
                          ⌵
                        </span>
                      </div>
                    </div>

                    {/* Expanded Tracking */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '24px 28px', background: 'var(--bg-elevated)' }}>

                        {/* Delivery ETA */}
                        <div style={{
                          display: 'flex', gap: 16, marginBottom: 28,
                          background: 'var(--bg-card)', borderRadius: 12, padding: '16px 20px',
                          flexWrap: 'wrap',
                        }}>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Expected Delivery</div>
                            <div style={{ fontWeight: 700, color: delivery?.color || '#F59E0B', fontSize: '1rem' }}>
                              {formatExpectedDate(order.expectedDelivery)}
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delivering To</div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.userPincode}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.userAddress?.slice(0, 60)}...</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shipping Zone</div>
                            <div style={{ fontWeight: 700, color: delivery?.color || '#F59E0B' }}>
                              {delivery?.zone || order.deliveryZone}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              From {order.brandPincode} → {order.userPincode}
                            </div>
                          </div>
                          {userLocation && (
                            <div style={{ flex: 1, minWidth: 140 }}>
                              <div style={{ fontSize: '0.7rem', color: '#10B981', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>📡 Your GPS</div>
                              <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                {userLocation.lat.toFixed(4)}°N, {userLocation.lon.toFixed(4)}°E
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#10B981' }}>±{userLocation.accuracy}m accuracy</div>
                            </div>
                          )}
                        </div>

                        {/* Tracking Steps */}
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontWeight: 700, marginBottom: 20, fontSize: '0.9rem' }}>📍 Live Order Tracking</div>
                          <div style={{ position: 'relative' }}>
                            {/* Progress line */}
                            <div style={{
                              position: 'absolute', left: 24, top: 24, bottom: 24, width: 2,
                              background: 'var(--border)', borderRadius: 2,
                            }} />
                            <div style={{
                              position: 'absolute', left: 24, top: 24, width: 2,
                              height: `${Math.min(100, (currentStep / 4) * 100)}%`,
                              background: 'linear-gradient(180deg, #F59E0B, #10B981)',
                              borderRadius: 2, transition: 'height 0.5s ease',
                            }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                              {TRACK_STEPS.map((step, idx) => {
                                const done = idx <= currentStep;
                                const active = idx === currentStep;
                                return (
                                  <div key={idx} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: idx < TRACK_STEPS.length - 1 ? 24 : 0 }}>
                                    {/* Step dot */}
                                    <div style={{
                                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: 20, position: 'relative', zIndex: 1,
                                      background: done
                                        ? (active ? 'var(--accent)' : 'rgba(16,185,129,0.2)')
                                        : 'var(--bg-card)',
                                      border: `2px solid ${done ? (active ? 'var(--accent)' : '#10B981') : 'var(--border)'}`,
                                      boxShadow: active ? '0 0 0 4px rgba(245,158,11,0.2)' : 'none',
                                      transition: 'all 0.4s ease',
                                    }}>
                                      {step.icon}
                                    </div>
                                    <div style={{ paddingTop: 8 }}>
                                      <div style={{
                                        fontWeight: active ? 700 : 600, fontSize: '0.9rem',
                                        color: done ? 'var(--text-primary)' : 'var(--text-muted)',
                                        marginBottom: 2,
                                      }}>
                                        {step.label}
                                        {active && (
                                          <span style={{
                                            marginLeft: 8, fontSize: '0.7rem', fontWeight: 700,
                                            color: '#F59E0B', background: 'rgba(245,158,11,0.1)',
                                            padding: '2px 8px', borderRadius: 999,
                                            animation: 'pulse 1.5s infinite',
                                          }}>LIVE</span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                                      {done && idx === 0 && (
                                        <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: 2 }}>
                                          {formatDate(order.createdAt?.toDate?.()?.toISOString() || new Date(order.createdAt?.seconds * 1000).toISOString())}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic delivery message */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(16,185,129,0.06))',
                          border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
                          fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: 10, alignItems: 'center',
                        }}>
                          <span style={{ fontSize: 20 }}>ℹ️</span>
                          <span>
                            {currentStep < 1
                              ? `Your order is being processed at ${order.brandName}'s warehouse.`
                              : currentStep < 4
                                ? `Your paint is on its way! Current Status: ${order.status?.toUpperCase() || 'SHIPPED'}. ETA: ${formatExpectedDate(order.expectedDelivery)}.`
                                : `Delivered! We hope you love your ${order.productTitle || 'paint'}. Rate your experience!`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
