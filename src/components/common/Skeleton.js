// src/components/common/Skeleton.js
import React from 'react';

const Skeleton = ({ width, height = 20, borderRadius = 6, style = {} }) => (
    <div style={{
        width: width || '100%',
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-secondary) 50%, var(--bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style
    }} />
);

export const SkeletonCard = () => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton height={24} width="60%" />
        <Skeleton height={14} width="40%" />
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton height={14} />
            <Skeleton height={14} width="80%" />
            <Skeleton height={14} width="90%" />
        </div>
    </div>
);

export const SkeletonStatCard = () => (
    <div className="stat-card">
        <Skeleton width={44} height={44} borderRadius={10} style={{ marginBottom: 16 }} />
        <Skeleton height={36} width="60%" style={{ marginBottom: 8 }} />
        <Skeleton height={12} width="80%" style={{ marginBottom: 8 }} />
        <Skeleton height={12} width="50%" />
    </div>
);

export const SkeletonRow = () => (
    <tr>
        {[1, 2, 3, 4, 5].map(i => (
            <td key={i} style={{ padding: '14px 16px' }}>
                <Skeleton height={16} width={i === 1 ? '80%' : i === 3 ? '60%' : '100%'} />
            </td>
        ))}
    </tr>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th><Skeleton height={12} width="80%" /></th>
                    <th><Skeleton height={12} width="80%" /></th>
                    <th><Skeleton height={12} width="80%" /></th>
                    <th><Skeleton height={12} width="80%" /></th>
                    <th><Skeleton height={12} width="80%" /></th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
        </table>
    </div>
);

export const SkeletonStatsGrid = ({ count = 4 }) => (
    <div className="stats-grid">
        {Array.from({ length: count }).map((_, i) => <SkeletonStatCard key={i} />)}
    </div>
);

export default Skeleton;
