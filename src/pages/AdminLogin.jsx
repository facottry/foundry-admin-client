import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const admin = await login(email, password);
            // All admins from admins collection are valid
            navigate('/dashboard');
        } catch (err) {
            // Extract error message from axios response or use fallback
            // Backend returns: { success: false, error: { code, message } }
            const errorMessage = err.response?.data?.error?.message ||
                err.response?.data?.message ||
                err.message ||
                'Invalid credentials';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '50px auto', borderColor: '#333' }}>
            <h2 style={{ color: '#d32f2f' }}>Admin Portal</h2>

            {error && (
                <div style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    border: '1px solid #ef9a9a'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            style={{ width: '100%', padding: '8px', paddingRight: '40px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                fontSize: '16px',
                                color: '#666'
                            }}
                            tabIndex={-1}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                        width: '100%',
                        background: loading ? '#999' : '#d32f2f',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Signing in...' : 'Admin Login'}
                </button>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/forgot-password" style={{ color: '#666', fontSize: '0.9rem' }}>Forgot Password?</Link>
            </div>
        </div>
    );
};

export default AdminLogin;
