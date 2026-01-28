import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/send-otp', { email });
            setStep(2);
            setMessage('OTP sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            alert('Password reset successfully. Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '50px auto', borderColor: '#333' }}>
            <h2 style={{ color: '#d32f2f' }}>Reset Password</h2>

            {message && <div style={{ marginBottom: '15px', color: 'green' }}>{message}</div>}
            {error && <div style={{ marginBottom: '15px', color: 'red' }}>{error}</div>}

            {step === 1 ? (
                <form onSubmit={handleSendOtp}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', background: '#d32f2f', border: 'none' }}>
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>OTP Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            required
                            placeholder="Enter 6-digit OTP"
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', background: '#d32f2f', border: 'none' }}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/login" style={{ color: '#666', fontSize: '0.9rem' }}>Back to Login</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
