import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) setUser(JSON.parse(storedUser));

                    // Ensure API base is set even on refresh
                    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/admin';
                    if (!localStorage.getItem('apiBase')) {
                        localStorage.setItem('apiBase', apiBase);
                    }
                } catch (err) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        // api.post returns response.data (which is { success, data })
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        // Save API base for checklist.html to use
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/admin';
        localStorage.setItem('apiBase', apiBase);

        setUser(res.data.user);
        return res.data.user;
    };

    const loginWithOTP = async (email, otp) => {
        const res = await api.post('/auth/login-otp', { email, otp });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
    };

    const signup = async (name, email, password, role) => {
        const res = await api.post('/auth/signup', { name, email, password, role });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithOTP, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
