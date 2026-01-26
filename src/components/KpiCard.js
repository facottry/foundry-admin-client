import React from 'react';

const KpiCard = ({ label, value, subtitle, trend }) => {
    return (
        <div style={{
            background: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            <div style={{
                fontSize: '0.85rem',
                color: '#666',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '4px'
            }}>
                {value?.toLocaleString() || '0'}
            </div>
            {subtitle && (
                <div style={{ fontSize: '0.9rem', color: '#999' }}>
                    {subtitle}
                </div>
            )}
            {trend && (
                <div style={{
                    fontSize: '0.85rem',
                    color: trend > 0 ? '#10b981' : '#ef4444',
                    marginTop: '8px'
                }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
            )}
        </div>
    );
};

export default KpiCard;
