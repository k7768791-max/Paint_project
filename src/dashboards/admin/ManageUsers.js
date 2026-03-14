// src/dashboards/admin/ManageUsers.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import { collection, onSnapshot, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/common/Toast';
import { SkeletonTable } from '../../components/common/Skeleton';

const roleColors = { user: 'badge-info', manufacturer: 'badge-warning', brand: 'badge-success', admin: 'badge-danger' };
const planColors = { free: 'badge-default', premium: 'badge-warning', pro: 'badge-success' };

const ManageUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPredCount, setUserPredCount] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const filtered = users.filter(u => {
    const matchRole = filter === 'all' || u.role === filter;
    const matchPlan = planFilter === 'all' || u.subscription === planFilter;
    const matchSearch = !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    return matchRole && matchPlan && matchSearch;
  });

  const toggleStatus = async (u) => {
    const newStatus = u.status === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'users', u.id), { status: newStatus });
      showToast(`User ${newStatus === 'active' ? 'restored' : 'suspended'}: ${u.name}`, newStatus === 'active' ? 'success' : 'warning');
    } catch {
      showToast('Failed to update user status', 'error');
    }
  };

  const changePlan = async (uid, plan) => {
    try {
      await updateDoc(doc(db, 'users', uid), { subscription: plan });
      showToast(`Subscription updated to ${plan}`, 'success');
    } catch {
      showToast('Failed to update subscription', 'error');
    }
  };

  const viewUser = async (u) => {
    setSelectedUser(u);
    // Get pred count
    try {
      const q = query(collection(db, 'predictions'), where('uid', '==', u.id));
      const snap = await getDocs(q);
      setUserPredCount(prev => ({ ...prev, [u.id]: snap.size }));
    } catch { }
  };

  const formatDate = (ts) => {
    if (!ts?.seconds) return ts || '-';
    return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Subscription', 'Status', 'Joined'];
    const rows = filtered.map(u => [u.name, u.email, u.role, u.subscription, u.status, formatDate(u.createdAt)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chromaai_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Manage Users" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">👥 User Management</h1>
            <p className="page-subtitle">View, manage, and control all platform users in real-time</p>
          </div>

          <div className="stats-grid">
            {[
              { label: 'Total Users', value: users.length, icon: '👥', bg: 'var(--accent-glow)' },
              { label: 'Manufacturers', value: users.filter(u => u.role === 'manufacturer').length, icon: '🏭', bg: 'rgba(59,130,246,0.1)' },
              { label: 'Brand Partners', value: users.filter(u => u.role === 'brand').length, icon: '🏷️', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: '🚫', bg: 'rgba(239,68,68,0.1)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <input className="form-control" style={{ width: 220 }} placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-control" style={{ width: 150 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="manufacturer">Manufacturers</option>
              <option value="brand">Brands</option>
              <option value="admin">Admins</option>
            </select>
            <select className="form-control" style={{ width: 150 }} value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="pro">Pro</option>
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <span className="badge badge-info" style={{ padding: '6px 12px' }}>{filtered.length} users</span>
              <button className="btn btn-secondary btn-sm" onClick={exportCSV}>📥 Export CSV</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 320px' : '1fr', gap: 20 }}>
            {/* Table */}
            {loading ? <SkeletonTable rows={6} /> : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Plan</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{u.email}</td>
                        <td><span className={`badge ${roleColors[u.role] || 'badge-default'}`}>{u.role}</span></td>
                        <td>
                          <select
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: '0.78rem', width: 100 }}
                            value={u.subscription || 'free'}
                            onChange={e => changePlan(u.id, e.target.value)}
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="pro">Pro</option>
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(u.createdAt)}</td>
                        <td><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{u.status || 'active'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className={`btn btn-sm ${(u.status || 'active') === 'active' ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => toggleStatus(u)}
                            >
                              {(u.status || 'active') === 'active' ? 'Suspend' : 'Restore'}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => viewUser(u)}>View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* User Detail Panel */}
            {selectedUser && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, alignSelf: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>User Details</div>
                  <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: '#000', margin: '0 auto 16px' }}>
                  {selectedUser.name?.charAt(0) || 'U'}
                </div>
                {[
                  ['Name', selectedUser.name],
                  ['Email', selectedUser.email],
                  ['Role', selectedUser.role],
                  ['Plan', selectedUser.subscription || 'free'],
                  ['Status', selectedUser.status || 'active'],
                  ['Predictions', userPredCount[selectedUser.id] ?? '...'],
                  ['Joined', formatDate(selectedUser.createdAt)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <button
                  className={`btn btn-full btn-sm ${(selectedUser.status || 'active') === 'active' ? 'btn-danger' : 'btn-success'}`}
                  style={{ marginTop: 16 }}
                  onClick={() => toggleStatus(selectedUser)}
                >
                  {(selectedUser.status || 'active') === 'active' ? '🚫 Suspend User' : '✅ Restore User'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;