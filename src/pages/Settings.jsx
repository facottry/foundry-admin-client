import React, { useState, useEffect, useContext } from 'react';
import InfrastructureSettings from './InfrastructureSettings';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { PERMISSIONS, RESOURCE_LABELS } from '../utils/permissionRegistry';

/**
 * Change Password Form Component
 */
const ChangePasswordForm = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setLoading(true);
        try {
            await api.put('/admin/auth/change-password', { newPassword });
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
            {message.text && (
                <div style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                    color: message.type === 'error' ? '#dc2626' : '#16a34a',
                    fontSize: '14px'
                }}>
                    {message.text}
                </div>
            )}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    New Password
                </label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px'
                    }}
                    placeholder="Enter new password"
                />
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Confirm Password
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px'
                    }}
                    placeholder="Confirm new password"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: loading ? '#9ca3af' : '#1a1a1a',
                    color: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                }}
            >
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
};


const Settings = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('account');
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Reset Password State
    const [resettingPasswordAdmin, setResetPasswordAdmin] = useState(null);
    const [resetPasswordValue, setResetPasswordValue] = useState('');

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    // Filter tabs based on role
    const tabs = [
        { id: 'account', label: 'Account' },
        { id: 'general', label: 'General' },
        { id: 'infrastructure', label: 'Infrastructure' },
        { id: 'security', label: 'Security' },
        ...(isSuperAdmin ? [{ id: 'team', label: 'Team' }] : []),
    ];

    useEffect(() => {
        if (activeTab === 'team' && isSuperAdmin) {
            fetchAdmins();
        }
    }, [activeTab]);

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        setError('');
        try {
            const res = await api.get('/admin/admins');
            if (res?.data?.admins) {
                setAdmins(res.data.admins);
            }
        } catch (err) {
            console.error('Failed to fetch admins', err);
            setError('Failed to load admins');
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleRoleChange = (admin, newRole) => {
        setEditingAdmin({
            ...admin,
            role: newRole,
            permissions: newRole === 'SUPER_ADMIN' ? [] : (admin.permissions || [])
        });
    };

    const openPermissionEditor = (admin) => {
        setEditingAdmin({ ...admin });
    };

    const togglePermission = (perm) => {
        if (!editingAdmin) return;

        const currentPerms = [...(editingAdmin.permissions || [])];

        // Find resource for this permission
        const resource = Object.keys(PERMISSIONS).find(r =>
            PERMISSIONS[r].includes(perm)
        );

        if (resource && PERMISSIONS[resource].length === 2) {
            // Mutual exclusion: VIEW and EDIT cannot coexist
            const viewPerm = PERMISSIONS[resource].find(p => p.endsWith('_VIEW'));
            const editPerm = PERMISSIONS[resource].find(p => p.endsWith('_EDIT'));

            if (perm === editPerm && currentPerms.includes(viewPerm)) {
                const idx = currentPerms.indexOf(viewPerm);
                currentPerms.splice(idx, 1);
            } else if (perm === viewPerm && currentPerms.includes(editPerm)) {
                const idx = currentPerms.indexOf(editPerm);
                currentPerms.splice(idx, 1);
            }
        }

        // Toggle the selected permission
        const idx = currentPerms.indexOf(perm);
        if (idx === -1) {
            currentPerms.push(perm);
        } else {
            currentPerms.splice(idx, 1);
        }

        setEditingAdmin({ ...editingAdmin, permissions: currentPerms });
    };

    const saveAdmin = async () => {
        if (!editingAdmin) return;

        setSaving(true);
        setError('');

        try {
            const payload = {
                role: editingAdmin.role,
                permissions: editingAdmin.permissions || []
            };

            await api.put(`/admin/admins/${editingAdmin._id}`, payload);

            // Update local state
            setAdmins(admins.map(a =>
                a._id === editingAdmin._id
                    ? { ...a, role: editingAdmin.role, permissions: editingAdmin.permissions }
                    : a
            ));
            setEditingAdmin(null);
        } catch (err) {
            console.error('Failed to save admin', err);
            setError(err.response?.data?.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditingAdmin(null);
        setError('');
    };

    const openResetPasswordModal = (admin) => {
        setResetPasswordAdmin(admin);
        setResetPasswordValue('');
        setError('');
    };

    const submitResetPassword = async () => {
        if (!resetPasswordValue || resetPasswordValue.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await api.put(`/admin/admins/${resettingPasswordAdmin._id}/password`, {
                newPassword: resetPasswordValue
            });
            setResetPasswordAdmin(null);
            setResetPasswordValue('');
            // Optional: Show success toast
            alert('Password reset successfully');
        } catch (err) {
            console.error('Failed to reset password', err);
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setSaving(false);
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
                {activeTab === 'account' && (
                    <div className="card">
                        <h3>Account</h3>
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <p style={{ color: '#666', marginBottom: '8px' }}>Logged in as:</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{user?.email}</p>
                                <span style={{
                                    display: 'inline-block',
                                    marginTop: '8px',
                                    background: user?.role === 'SUPER_ADMIN' ? '#fef3c7' : '#e0e7ff',
                                    color: user?.role === 'SUPER_ADMIN' ? '#92400e' : '#4338ca',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    {user?.role}
                                </span>
                            </div>

                            {/* Change Password Form */}
                            <div style={{
                                marginTop: '32px',
                                paddingTop: '24px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: '600' }}>Change Password</h4>
                                <ChangePasswordForm />
                            </div>

                            {/* Logout */}
                            <div style={{
                                marginTop: '32px',
                                paddingTop: '24px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <button
                                    onClick={logout}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#ef4444',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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

                {activeTab === 'team' && isSuperAdmin && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Team Management ({admins.length})</h3>
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                                marginBottom: '16px'
                            }}>
                                {error}
                            </div>
                        )}

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
                                                    <select
                                                        value={admin.role}
                                                        onChange={(e) => handleRoleChange(admin, e.target.value)}
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #d1d5db',
                                                            fontSize: '13px',
                                                            fontWeight: '500',
                                                            background: admin.role === 'SUPER_ADMIN' ? '#fef3c7' : '#e0e7ff',
                                                            color: admin.role === 'SUPER_ADMIN' ? '#92400e' : '#4338ca',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '16px 12px', color: '#666', fontSize: '14px' }}>
                                                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                                    {admin.role === 'ADMIN' && (
                                                        <button
                                                            onClick={() => openPermissionEditor(admin)}
                                                            style={{
                                                                color: '#2563eb',
                                                                background: 'none',
                                                                border: 'none',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500',
                                                                marginRight: '12px'
                                                            }}
                                                        >
                                                            Edit Permissions
                                                        </button>
                                                    )}
                                                    <button style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                                                        Remove
                                                    </button>

                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={() => openResetPasswordModal(admin)}
                                                            style={{
                                                                marginLeft: '12px',
                                                                color: '#4b5563',
                                                                background: 'none',
                                                                border: 'none',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            Reset Password
                                                        </button>
                                                    )}
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

            {/* Permission Editor Modal */}
            {editingAdmin && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        width: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                {editingAdmin.role === 'SUPER_ADMIN'
                                    ? `Change Role for ${editingAdmin.email}`
                                    : `Permissions for ${editingAdmin.email}`
                                }
                            </h3>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {/* Role Selector */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Role</label>
                                <select
                                    value={editingAdmin.role}
                                    onChange={(e) => setEditingAdmin({
                                        ...editingAdmin,
                                        role: e.target.value,
                                        permissions: e.target.value === 'SUPER_ADMIN' ? [] : editingAdmin.permissions
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            {/* Permission Editor (only for ADMIN) */}
                            {editingAdmin.role === 'ADMIN' && (
                                <div>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        marginBottom: '16px',
                                        padding: '8px 12px',
                                        background: '#f3f4f6',
                                        borderRadius: '6px'
                                    }}>
                                        ⚠️ VIEW and EDIT cannot be selected together for the same resource
                                    </p>

                                    {Object.keys(PERMISSIONS).map(resource => (
                                        <div key={resource} style={{ marginBottom: '16px' }}>
                                            <div style={{
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                color: '#374151',
                                                marginBottom: '8px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {RESOURCE_LABELS[resource]}
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                {PERMISSIONS[resource].map(perm => {
                                                    const isChecked = (editingAdmin.permissions || []).includes(perm);
                                                    const label = perm.split('_').pop();

                                                    return (
                                                        <label
                                                            key={perm}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                color: '#555'
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => togglePermission(perm)}
                                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                            />
                                                            {label}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {editingAdmin.role === 'SUPER_ADMIN' && (
                                <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, color: '#92400e' }}>
                                        SUPER_ADMIN has full access. Permissions not applicable.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={cancelEdit}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveAdmin}
                                disabled={saving || (editingAdmin.role === 'ADMIN' && (!editingAdmin.permissions || editingAdmin.permissions.length === 0))}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: (editingAdmin.role === 'ADMIN' && (!editingAdmin.permissions || editingAdmin.permissions.length === 0))
                                        ? '#d1d5db'
                                        : '#1a1a1a',
                                    color: '#fff',
                                    cursor: (editingAdmin.role === 'ADMIN' && (!editingAdmin.permissions || editingAdmin.permissions.length === 0))
                                        ? 'not-allowed'
                                        : 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resettingPasswordAdmin && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        width: '400px',
                        padding: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
                            Reset Password for {resettingPasswordAdmin.name || 'Admin'}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
                            Enter a new password for <strong>{resettingPasswordAdmin.email}</strong>.
                        </p>

                        <input
                            type="password"
                            value={resetPasswordValue}
                            onChange={(e) => setResetPasswordValue(e.target.value)}
                            placeholder="New Password (min 8 chars)"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                marginBottom: '20px'
                            }}
                        />

                        {error && (
                            <div style={{
                                padding: '10px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                                fontSize: '13px',
                                marginBottom: '16px'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setResetPasswordAdmin(null);
                                    setResetPasswordValue('');
                                    setError('');
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitResetPassword}
                                disabled={saving}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#ef4444',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}
                            >
                                {saving ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
