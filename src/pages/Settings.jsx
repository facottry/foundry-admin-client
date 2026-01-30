import React, { useState, useEffect } from 'react';
import InfrastructureSettings from './InfrastructureSettings';
import api from '../utils/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('infrastructure');
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'infrastructure', label: 'Infrastructure' },
        { id: 'security', label: 'Security' },
        { id: 'team', label: 'Team' },
    ];

    useEffect(() => {
        if (activeTab === 'team') {
            fetchAdmins();
        }
    }, [activeTab]);

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const res = await api.get('/admin/users?role=ADMIN');
            // Backend returns { success: true, data: { users: ... } }
            if (res && res.data && res.data.users) {
                setAdmins(res.data.users);
            } else if (res && res.users) {
                // Fallback if structure changes
                setAdmins(res.users);
            }
        } catch (err) {
            console.error('Failed to fetch admins', err);
        } finally {
            setLoadingAdmins(false);
        }
    };

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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Team Management ({admins.length})</h3>
                        </div>

                        {loadingAdmins ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading admins...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee', background: '#f9fafb' }}>
                                            <th style={{ padding: '12px', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Name</th>
                                            <th style={{ padding: '12px', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Email</th>
                                            <th style={{ padding: '12px', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Role</th>
                                            <th style={{ padding: '12px', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Joined</th>
                                            <th style={{ padding: '12px', fontSize: '13px', color: '#666', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map(admin => (
                                            <tr key={admin._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px 12px', fontWeight: '500' }}>{admin.name || 'Admin User'}</td>
                                                <td style={{ padding: '16px 12px', color: '#555' }}>{admin.email}</td>
                                                <td style={{ padding: '16px 12px' }}>
                                                    <span style={{
                                                        background: '#e0e7ff',
                                                        color: '#4338ca',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {admin.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 12px', color: '#666', fontSize: '14px' }}>
                                                    {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '-'}
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                                    <button style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {admins.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                                                    No admin users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
