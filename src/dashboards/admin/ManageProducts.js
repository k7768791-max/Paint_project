// src/dashboards/admin/ManageProducts.js
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/common/Toast';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';

const ManageProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'brand_products'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProducts(all);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleAction = async (product, action) => {
    setProcessing(p => ({ ...p, [product.id]: true }));
    try {
      await updateDoc(doc(db, 'brand_products', product.id), {
        status: action,
        reviewedAt: serverTimestamp(),
        adminNote: action === 'rejected' ? 'Product was rejected by admin' : undefined,
      });

      // Notify brand
      if (product.brandUid) {
        await addDoc(collection(db, `notifications/${product.brandUid}/items`), {
          message: action === 'approved'
            ? `✅ Your product "${product.title}" has been approved and is now live!`
            : `❌ Your product "${product.title}" was rejected. Please revise and resubmit.`,
          type: action === 'approved' ? 'success' : 'error',
          read: false,
          link: '/brand/dashboard',
          createdAt: serverTimestamp(),
        });
      }

      showToast(`Product ${action} successfully!`, action === 'approved' ? 'success' : 'error');
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setProcessing(p => ({ ...p, [product.id]: false }));
    }
  };

  const filtered = products.filter(p => filter === 'all' || p.status === filter);

  const counts = {
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    rejected: products.filter(p => p.status === 'rejected').length,
    all: products.length,
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Product Approvals" />
        <div className="page-content">

          <div className="page-header">
            <h1 className="page-title">📦 Product Approval Center</h1>
            <p className="page-subtitle">Review and approve brand product submissions before they go live on the Products page</p>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { icon: '⏳', value: counts.pending, label: 'Pending Review', bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
              { icon: '✅', value: counts.approved, label: 'Approved & Live', bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
              { icon: '❌', value: counts.rejected, label: 'Rejected', bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
              { icon: '📦', value: counts.all, label: 'Total Submitted', bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, fontSize: 22 }}>{s.icon}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', borderRadius: 10, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: filter === f ? 'var(--accent)' : 'transparent',
                  color: filter === f ? '#000' : 'var(--text-secondary)',
                  fontWeight: filter === f ? 700 : 500, fontSize: '0.8rem',
                  transition: 'all 0.2s', textTransform: 'capitalize',
                }}
              >
                {f} {counts[f] > 0 && <span style={{ marginLeft: 4, fontWeight: 700 }}>({counts[f]})</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 600 }}>No {filter} products</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {filtered.map(product => (
                <div key={product.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
                  borderLeft: `4px solid ${product.status === 'approved' ? '#10B981' : product.status === 'rejected' ? '#EF4444' : '#F59E0B'}`,
                }}>
                  {/* Product Image */}
                  {(product.imageUrl || product.color) && (
                    <div style={{ height: 130, position: 'relative', overflow: 'hidden', background: product.color || 'var(--bg-elevated)' }}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8 }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: product.color || '#F59E0B', border: '3px solid rgba(255,255,255,0.3)' }} />
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{product.colorName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ padding: '16px 18px' }}>
                    {/* Brand badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {product.brandName}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, fontWeight: 700, textTransform: 'capitalize',
                        background: product.status === 'approved' ? 'rgba(16,185,129,0.15)' : product.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                        color: product.status === 'approved' ? '#10B981' : product.status === 'rejected' ? '#EF4444' : '#F59E0B',
                      }}>{product.status}</span>
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{product.title}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                      {product.description?.slice(0, 120)}...
                    </p>

                    {/* Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14, fontSize: '0.78rem' }}>
                      {[
                        ['💰 Price', `₹${parseFloat(product.price || 0).toLocaleString('en-IN')}`],
                        ['🏷️ Category', product.category || '-'],
                        ['🔧 Surface', product.surface || 'All'],
                        ['📦 Stock', `${product.stock || 0} units`],
                        ['📍 Pincode', product.brandPincode || '-'],
                        ['🎯 Discount', `${product.discount || 0}%`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '6px 10px' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Submission date */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                      📅 Submitted: {product.createdAt?.seconds ? new Date(product.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                    </div>

                    {/* Action Buttons */}
                    {product.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleAction(product, 'approved')}
                          disabled={processing[product.id]}
                          style={{
                            flex: 1, padding: '10px', borderRadius: 8,
                            border: processing[product.id] ? '1px solid var(--border)' : '1px solid rgba(16,185,129,0.3)',
                            background: processing[product.id] ? 'var(--bg-elevated)' : 'rgba(16,185,129,0.1)',
                            color: '#10B981', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { if (!processing[product.id]) { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = '#fff'; }}}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#10B981'; }}
                        >
                          {processing[product.id] ? '⏳' : '✅ Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(product, 'rejected')}
                          disabled={processing[product.id]}
                          style={{
                            flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#EF4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { if (!processing[product.id]) { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff'; }}}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                        >
                          {processing[product.id] ? '⏳' : '❌ Reject'}
                        </button>
                      </div>
                    )}

                    {product.status !== 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {product.status === 'approved' && (
                          <button
                            onClick={() => handleAction(product, 'rejected')}
                            disabled={processing[product.id]}
                            style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                          >Revoke</button>
                        )}
                        {product.status === 'rejected' && (
                          <button
                            onClick={() => handleAction(product, 'approved')}
                            disabled={processing[product.id]}
                            style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#10B981', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                          >Re-Approve</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
