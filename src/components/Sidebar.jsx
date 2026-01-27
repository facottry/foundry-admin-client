import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const sections = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'products', label: 'Products', icon: '📦', path: '/products' },
        { id: 'users', label: 'Users', icon: '👥', path: '/users' },
        { id: 'traffic', label: 'Traffic', icon: '🚦', path: '/traffic' },
        { id: 'economics', label: 'Economics', icon: '💰', path: '/economics' },
        { id: 'campaigns', label: 'Campaigns', icon: '📢', path: '/campaigns' },
        { id: 'moderation', label: 'Moderation', icon: '⚖️', path: '/moderation' },
        { id: 'messages', label: 'Messages', icon: '💬', path: '/messages' }
    ];

    return (
        <div style={{
            width: '240px',
            background: '#1a1a1a',
            minHeight: '100vh',
            padding: '20px 0',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ padding: '0 20px', marginBottom: '30px' }}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', margin: 0 }}>Admin Panel</h2>
            </div>

            <nav>
                {sections.map(section => {
                    const isActive = location.pathname === section.path;
                    return (
                        <button
                            key={section.id}
                            onClick={() => navigate(section.path)}
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                background: isActive ? '#333' : 'transparent',
                                border: 'none',
                                borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
                                color: isActive ? '#fff' : '#999',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: isActive ? '600' : '400',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.target.style.background = '#222';
                                    e.target.style.color = '#fff';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#999';
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
                            {section.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
