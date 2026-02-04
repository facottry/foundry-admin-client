import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar, logout }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/founders', label: 'Founders', icon: '👥' },
        { path: '/products', label: 'Products', icon: '📦' },
        { path: '/newsletters', label: 'Newsletter', icon: '📰' },
        { path: '/personalities', label: 'Bot Personalities', icon: '🤖' },
        { path: '/messages', label: 'Messages', icon: '✉️' },
        { path: '/server-health', label: 'Server Health', icon: '🏥' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];


    return (
        <aside
            className={`admin-sidebar ${isOpen ? 'open' : ''}`}
        >
            <div className="sidebar-header">
                <Link to="/dashboard" className="brand-logo">www.clicktory.in</Link>
                <button className="close-sidebar-btn md:hidden" onClick={toggleSidebar}>×</button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => window.innerWidth < 768 && toggleSidebar()}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <Link to="/change-password" className="sidebar-link">
                    <span className="icon">🔒</span>
                    <span className="label">Change Password</span>
                </Link>
                <button onClick={logout} className="sidebar-link logout-btn">
                    <span className="icon">🚪</span>
                    <span className="label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
