import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Foundry.io</Link>
            <div>
                <Link to="/">Home</Link>
                {user ? (
                    <>
                        {user.role === 'FOUNDER' && <Link to="/dashboard/founder">Dashboard</Link>}
                        {user.role === 'CUSTOMER' && <Link to="/dashboard/customer">My Profile</Link>}
                        {user.role === 'ADMIN' && <Link to="/dashboard/admin">Admin</Link>}
                        <button onClick={onLogout} className="btn" style={{ marginLeft: '20px' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup" className="btn btn-primary" style={{ marginLeft: '20px', color: '#fff' }}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
