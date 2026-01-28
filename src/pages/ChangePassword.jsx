import React, { useState } from 'react';
import api from '../utils/api';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await api.post('/auth/change-password', { newPassword });
            setMessage('Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2>Change Password</h2>

            {message && <div style={{ marginBottom: '15px', color: 'green', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>{message}</div>}
            {error && <div style={{ marginBottom: '15px', color: 'red', padding: '10px', background: '#f8d7da', borderRadius: '4px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
