// src/components/common/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ title }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropRef = useRef(null);

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const dashboardPath = {
    user: '/user/dashboard',
    manufacturer: '/manufacturer/dashboard',
    brand: '/brand/dashboard',
    admin: '/admin/dashboard'
  }[userProfile?.role] || '/';

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="top-navbar">
      <div className="top-navbar-title">{title}</div>
      <div className="top-navbar-actions">
        <NotificationBell />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: 4 }}>
          {userProfile?.name || 'User'}
        </div>
        <div ref={dropRef} style={{ position: 'relative' }}>
          <div
            className="avatar"
            onClick={() => setAvatarOpen(!avatarOpen)}
            id="navbar-avatar-btn"
            style={{ cursor: 'pointer' }}
            title={userProfile?.name}
          >
            {initials}
          </div>
          {avatarOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 8,
              width: 180,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow)',
              zIndex: 500,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{userProfile?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {userProfile?.role} · {userProfile?.subscription || 'free'}
                </div>
              </div>
              {[
                { label: '⚙️ Profile', action: () => navigate('/profile') },
                { label: '📊 Dashboard', action: () => navigate(dashboardPath) },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setAvatarOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    display: 'block',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  borderTop: '1px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: 'var(--danger)',
                  display: 'block'
                }}
                onMouseEnter={e => e.target.style.background = 'var(--danger-bg)'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;