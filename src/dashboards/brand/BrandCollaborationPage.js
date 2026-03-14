import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/common/Toast';

const BrandCollaborationPage = () => {
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', color: '', surface: '', price: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'brand_products'), where('brandUid', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user?.uid]);

  const handleAdd = async () => {
    if (!form.name || !form.sku || !form.price) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'brand_products'), {
        title: form.name,
        sku: form.sku,
        colorName: form.color,
        surface: form.surface,
        price: Number(form.price),
        discount: 0,
        brandName: userProfile?.name || 'Brand Partner',
        brandUid: user.uid,
        status: 'pending',
        description: 'New product awaiting admin approval',
        category: form.surface === 'Wall' ? 'Interior' : 'Specialty',
        createdAt: serverTimestamp()
      });
      // Admin notification
      await addDoc(collection(db, 'activity_logs'), {
        uid: user.uid, userName: userProfile?.name || 'Brand',
        role: 'brand', action: 'New product submitted',
        details: `"${form.name}" (SKU: ${form.sku})`,
        createdAt: serverTimestamp()
      });
      showToast('Product submitted for admin approval', 'success');
      setShowForm(false);
      setForm({ name: '', sku: '', color: '', surface: '', price: '' });
    } catch (err) {
      showToast('Failed to list product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Brand Collaboration" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">🤝 Product Collaboration</h1>
            <p className="page-subtitle">List your paint products to be recommended by our AI to users</p>
          </div>

          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            ℹ️ Products listed here will appear in user recommendations when our AI suggests matching colors. You earn revenue for every click and purchase.
          </div>

          <Card title={`${products.length} Listed Products`}>
            {userProfile?.subscription === 'free' ? (
               <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span>🔒 <strong>Premium Feature.</strong> Upgrade your plan to list direct products on ChromaAI.</span>
                  <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/pricing'}>Upgrade Now</button>
               </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Add Product</button>
              </div>
            )}
            
            {showForm && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 20, marginBottom: 20, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 16, color: 'var(--accent)' }}>New Product</div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Product Name</label><input className="form-control" placeholder="e.g. WeatherShield Grey" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">SKU</label><input className="form-control" placeholder="e.g. WPG-001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Color</label><input className="form-control" placeholder="e.g. Cement Grey" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
                  <div className="form-group">
                    <label className="form-label">Surface</label>
                    <select className="form-control" value={form.surface} onChange={e => setForm({ ...form, surface: e.target.value })}>
                      <option value="">Select...</option>
                      {['Wall', 'Wood', 'Iron', 'Plastic', 'Concrete'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Price</label><input className="form-control" placeholder="e.g. $45" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" onClick={handleAdd} disabled={submitting}>
                    {submitting ? '⏳ Submitting...' : 'Submit for Review'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="table-wrapper">
              <table>
                <thead><tr><th>Color</th><th>Product Name</th><th>SKU</th><th>Surface</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products listed yet</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id}>
                      <td><div style={{ width: 28, height: 28, borderRadius: 6, background: p.color || '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }} /></td>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
                      <td>{p.surface}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{p.price}</td>
                      <td><span className={`badge ${p.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm">Edit</button>
                          <button className="btn btn-danger btn-sm">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandCollaborationPage;