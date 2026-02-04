import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">www.clicktory.in</Link>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle navigation"
                >
                    <span style={{ fontSize: '24px' }}>☰</span>
                </button>

                <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <Link to="/founders" onClick={() => setIsOpen(false)}>Founders</Link>
                            <Link to="/products" onClick={() => setIsOpen(false)}>Products</Link>
                            <Link to="/messages" onClick={() => setIsOpen(false)}>Messages</Link>
                            <Link to="/change-password" onClick={() => setIsOpen(false)}>Change Password</Link>
                            <button onClick={onLogout} className="btn-link" style={{ marginLeft: '20px' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
