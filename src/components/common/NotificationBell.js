// src/components/common/NotificationBell.js
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropRef = useRef(null);

    useEffect(() => {
        if (!user?.uid) return;
        const q = query(
            collection(db, `notifications/${user.uid}/items`),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const unsub = onSnapshot(q, snap => {
            setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, [user?.uid]);

    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = async (notif) => {
        if (notif.read) return;
        try {
            await updateDoc(doc(db, `notifications/${user.uid}/items`, notif.id), { read: true });
        } catch { }
    };

    const typeColors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        warning: 'var(--accent)',
        info: 'var(--info)'
    };

    const formatTime = (ts) => {
        if (!ts?.seconds) return 'Just now';
        const diff = Math.floor((Date.now() / 1000) - ts.seconds);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div ref={dropRef} style={{ position: 'relative' }}>
            <button
                className="notification-btn"
                onClick={() => setOpen(!open)}
                id="notif-bell-btn"
            >
                🔔
                {unreadCount > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 16,
                        height: 16,
                        background: 'var(--danger)',
                        borderRadius: '50%',
                        fontSize: '0.6rem',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        border: '2px solid var(--bg-secondary)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 8,
                    width: 340,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    zIndex: 500,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                        {unreadCount > 0 && (
                            <span className="badge badge-warning">{unreadCount} new</span>
                        )}
                    </div>

                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                🔔 No notifications yet
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => markRead(notif)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        background: notif.read ? 'transparent' : 'rgba(245,158,11,0.04)',
                                        transition: 'background 0.2s ease',
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: notif.read ? 'var(--text-muted)' : typeColors[notif.type] || 'var(--accent)',
                                        flexShrink: 0,
                                        marginTop: 6
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                            {notif.message}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                            {formatTime(notif.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
