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
        // NEW: Use dedicated admin auth endpoint
        const res = await api.post('/admin/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.admin));

        // Save API base for checklist.html to use
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/admin';
        localStorage.setItem('apiBase', apiBase);

        setUser(res.data.admin);
        return res.data.admin;
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
        // Clear localStorage
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear all cookies
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        setUser(null);

        // Redirect to login page
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithOTP, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
