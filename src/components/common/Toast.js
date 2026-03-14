// src/components/common/Toast.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const ICONS = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
};

const COLORS = {
    success: 'var(--success)',
    error: 'var(--danger)',
    info: 'var(--info)',
    warning: 'var(--accent)'
};

const BG_COLORS = {
    success: 'rgba(16,185,129,0.12)',
    error: 'rgba(239,68,68,0.12)',
    info: 'rgba(59,130,246,0.12)',
    warning: 'rgba(245,158,11,0.12)'
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                maxWidth: 360
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: '14px 16px',
                            background: BG_COLORS[toast.type] || BG_COLORS.info,
                            border: `1px solid ${COLORS[toast.type] || COLORS.info}40`,
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
                            backdropFilter: 'blur(10px)',
                            animation: 'toastIn 0.3s ease forwards',
                            cursor: 'pointer',
                            minWidth: 280
                        }}
                        onClick={() => removeToast(toast.id)}
                    >
                        <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                            {ICONS[toast.type] || ICONS.info}
                        </span>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                lineHeight: 1.4
                            }}>
                                {toast.message}
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: 16,
                                padding: 0,
                                flexShrink: 0
                            }}
                        >×</button>
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) return { showToast: () => { } };
    return ctx;
};

export default ToastProvider;
