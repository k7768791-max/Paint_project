// src/components/common/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navConfig = {
  user: [
    {
      section: 'MAIN', items: [
        { icon: '🏠', label: 'Dashboard', path: '/user/dashboard' },
        { icon: '🎨', label: 'Color Recommendation', path: '/user/recommend' },
        { icon: '📋', label: 'My History', path: '/user/history' },
        { icon: '🛒', label: 'Products', path: '/products' },
        { icon: '📦', label: 'My Orders', path: '/orders' },
      ]
    },
    {
      section: 'ACCOUNT', items: [
        { icon: '👤', label: 'My Profile', path: '/profile' },
        { icon: '💳', label: 'Pricing & Plans', path: '/pricing' },
      ]
    }
  ],
  manufacturer: [
    {
      section: 'MAIN', items: [
        { icon: '🏭', label: 'Dashboard', path: '/manufacturer/dashboard' },
        { icon: '🔬', label: 'Color Prediction', path: '/manufacturer/predict' },
        { icon: '⚗️', label: 'Quality Optimizer', path: '/manufacturer/quality' },
      ]
    },
    {
      section: 'ACCOUNT', items: [
        { icon: '👤', label: 'My Profile', path: '/profile' },
      ]
    }
  ],
  brand: [
    {
      section: 'ANALYTICS', items: [
        { icon: '📊', label: 'Analytics Dashboard', path: '/brand/dashboard' },
        { icon: '📈', label: 'Market Insights', path: '/brand/insights' },
      ]
    },
    {
      section: 'MANAGE', items: [
        { icon: '📦', label: 'Product Inventory', path: '/brand/dashboard' },
        { icon: '📢', label: 'Manage Ads', path: '/brand/ads' },
        { icon: '🤝', label: 'Collaborations', path: '/brand/collaboration' },
      ]
    },
    {
      section: 'ACCOUNT', items: [
        { icon: '👤', label: 'My Profile', path: '/profile' },
        { icon: '💳', label: 'Brand Subscription', path: '/brand-partners' },
      ]
    }
  ],
  admin: [
    {
      section: 'OVERVIEW', items: [
        { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
        { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
      ]
    },
    {
      section: 'MANAGE', items: [
        { icon: '👥', label: 'Users', path: '/admin/users' },
        { icon: '🤖', label: 'ML Models', path: '/admin/models' },
        { icon: '🏷️', label: 'Brand Ads', path: '/admin/ads' },
        { icon: '📦', label: 'Product Approvals', path: '/admin/products' },
        { icon: '📩', label: 'Contact', path: '/admin/contact' },
      ]
    },
    {
      section: 'ACCOUNT', items: [
        { icon: '👤', label: 'My Profile', path: '/profile' },
      ]
    }
  ]
};

const Sidebar = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = userProfile?.role || 'user';
  const sections = navConfig[role] || navConfig.user;
  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const planColors = { free: '#94A3B8', premium: '#F59E0B', pro: '#10B981' };
  const plan = userProfile?.subscription || 'free';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div className="sidebar-brand-icon">🎨</div>
        <div>
          <div className="sidebar-brand-name">ChromaAI</div>
          <div className="sidebar-brand-sub">Paint Intelligence</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec.section}>
            <div className="sidebar-section-label">{sec.section}</div>
            {sec.items.map(item => (
              <button
                key={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 16 }}>SESSION</div>
        <button className="sidebar-link" onClick={handleLogout}>
          <span className="sidebar-link-icon">🚪</span>
          Logout
        </button>
      </nav>

      <div className="sidebar-footer">
        {plan !== 'pro' && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '12px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/pricing')}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
              ⚡ Upgrade to Pro
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Unlock all AI features
            </div>
          </div>
        )}
        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userProfile?.name || 'User'}</div>
            <div className="sidebar-user-role" style={{ color: planColors[plan] }}>
              {plan.toUpperCase()} · {role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;