import React, { useState } from 'react';
import InfrastructureSettings from './InfrastructureSettings';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('infrastructure');

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'infrastructure', label: 'Infrastructure' },
        { id: 'security', label: 'Security' },
        { id: 'team', label: 'Team' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 16px 0' }}>Settings</h1>

                {/* Tabs Header */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #e5e7eb',
                    gap: '24px'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 0',
                                background: 'none',
                                border: 'none',
                                borderBottom: `2px solid ${activeTab === tab.id ? '#1a1a1a' : 'transparent'}`,
                                color: activeTab === tab.id ? '#1a1a1a' : '#6b7280',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '1rem'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content" style={{ animation: 'fadeIn 0.3s ease' }}>
                {activeTab === 'general' && (
                    <div className="card">
                        <h3>General Settings</h3>
                        <p style={{ color: '#666' }}>System Name, Localization, and other generic settings (Coming Soon).</p>
                    </div>
                )}

                {activeTab === 'infrastructure' && (
                    <InfrastructureSettings />
                )}

                {activeTab === 'security' && (
                    <div className="card">
                        <h3>Security Settings</h3>
                        <p style={{ color: '#666' }}>2FA, Password Policies, and Session Management (Coming Soon).</p>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="card">
                        <h3>Team Management</h3>
                        <p style={{ color: '#666' }}>Manage admin users and roles (Coming Soon).</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Settings;
