import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

const BrandDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();

  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    // Listen to Ads
    const qAds = query(collection(db, 'brand_ads'), where('brandUid', '==', user.uid));
    const unsubAds = onSnapshot(qAds, snap => setAds(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    // Listen to Products
    const qProducts = query(collection(db, 'brand_products'), where('brandUid', '==', user.uid));
    const unsubProducts = onSnapshot(qProducts, snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // Listen to Orders
    const qOrders = query(collection(db, 'orders'), where('brandUid', '==', user.uid));
    const unsubOrders = onSnapshot(qOrders, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setLoading(false);
    });

    return () => { unsubAds(); unsubProducts(); unsubOrders(); };
  }, [user?.uid]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const statusMap = {
        'processing': { step: 'Processing', icon: '⚙️' },
        'shipped': { step: 'Shipped', icon: '🚚' },
        'in transit': { step: 'In Transit', icon: '🚆' },
        'out for delivery': { step: 'Out for Delivery', icon: '🛵' },
        'delivered': { step: 'Delivered', icon: '✅' },
      };

      const dateStr = new Date().toISOString();
      const orderRef = doc(db, 'orders', orderId);

      // Simple implementation: Just update the top level status. The OrdersPage will reflect this.
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      // Optionally notify user
      const order = orders.find(o => o.id === orderId);
      if (order?.userId) {
        await addDoc(collection(db, `notifications/${order.userId}/items`), {
          message: `📦 Your order for ${order.productTitle} is now ${newStatus}.`,
          type: 'info', read: false, createdAt: serverTimestamp(), link: '/orders'
        });
      }
      showToast('Order status updated', 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressionCount || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clickCount || 0), 0);
  const revenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.price * o.qty), 0);


  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Brand Partner Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">🏷️ Brand Overview</h1>
            <p className="page-subtitle">Manage your campaigns, track performance, and explore market insights</p>
          </div>

          <div className="stats-grid">
            {[
              { icon: '👁️', value: totalImpressions.toLocaleString(), label: 'Total Impressions', bg: 'var(--accent-glow)' },
              { icon: '🖱️', value: totalClicks.toLocaleString(), label: 'Total Clicks', bg: 'rgba(16,185,129,0.1)' },
              { icon: '📦', value: products.length, label: 'Products Listed', bg: 'rgba(59,130,246,0.1)' },
              { icon: '💰', value: `₹${revenue.toLocaleString()}`, label: 'Delivered Sales', bg: 'rgba(168,85,247,0.1)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
            <Card title="🤝 Collaboration Center" subtitle="Submit and manage your brand partnerships">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                List your products for AI-powered recommendations. Users see your paints when our model recommends your colors.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/brand/collaboration')}>
                Manage Products →
              </button>
            </Card>

            <Card title="📈 Market Insights" subtitle="Data on color trends and user demand">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                See which colors and surfaces are trending. Align your production with real market demand.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/brand/insights')}>
                View Insights →
              </button>
            </Card>
          </div>

          <Card title="Active Campaigns" subtitle="Your running advertisements on ChromaAI"
            action={<button className="btn btn-primary btn-sm" onClick={() => navigate('/brand/ads')}>+ New Campaign</button>}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Campaign</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {ads.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No campaigns running</td></tr>
                  ) : ads.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.title}</td>
                      <td>{c.impressionCount || 0}</td>
                      <td>{c.clickCount || 0}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {c.impressionCount ? ((c.clickCount || 0) / c.impressionCount * 100).toFixed(1) : 0}%
                      </td>
                      <td><span className={`badge ${c.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div style={{ marginTop: 24 }}>
            <Card title="📦 Order Management" subtitle="Update fulfillment status for customer orders">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Status</th><th>Update Action</th></tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</td></tr>
                    ) : orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#{o.id.slice(0, 8)}</td>
                        <td>
                          <div>{o.userName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.userPhone}</div>
                        </td>
                        <td>{o.productTitle}</td>
                        <td>{o.qty}</td>
                        <td>
                          <span className={`badge ${['delivered'].includes(o.status) ? 'badge-success' : 'badge-info'}`}>
                            {o.status || 'confirmed'}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={o.status || 'confirmed'} 
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            disabled={o.status === 'delivered'}
                            className="form-control" style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="in transit">In Transit</option>
                            <option value="out for delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                          </select>
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
    </div>
  );
};

export default BrandDashboard;