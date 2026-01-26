import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext); // Can reuse context if it points to correct API
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            // Admin API expects same Login payload but separate endpoint maybe? 
            // Actually I implemented api/auth/login in AdminServer to handle it.
            // And AuthContext calls /auth/login. 
            // So reusing login() is fine as long as api.js points to 5001.
            const user = await login(email, password);
            if (user.role === 'ADMIN') {
                navigate('/dashboard'); // Admin Dashboard
            } else {
                alert('Access Denied: Not an Admin');
            }
        } catch (err) {
            alert(err.message || 'Login Failed');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '50px auto', borderColor: '#333' }}>
            <h2 style={{ color: '#d32f2f' }}>Admin Portal</h2>
            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#d32f2f', border: 'none' }}>Admin Login</button>
            </form>
        </div>
    );
};

export default AdminLogin;
