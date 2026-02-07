import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Permission-aware Sidebar
 * 
 * Renders menu items based on admin permissions.
 * SUPER_ADMIN (permissions=['*']) sees all items.
 * ADMIN sees only items matching their permissions.
 */
const Sidebar = ({ isOpen, toggleSidebar, permissions = [] }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    // Check if user is SUPER_ADMIN (wildcard permission)
    const isSuperAdmin = permissions.includes('*');

    // Menu items with required permissions
    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', permission: 'DASHBOARD_VIEW' },
        { path: '/founders', label: 'Founders', icon: '👥', permission: 'FOUNDERS_VIEW' },
        { path: '/products', label: 'Products', icon: '📦', permission: 'PRODUCTS_VIEW' },
        { path: '/newsletters', label: 'Newsletter', icon: '📰', permission: 'NEWSLETTER_EDIT' },
        { path: '/ai-jobs', label: 'AI Jobs', icon: '🤖', permission: 'AI_JOBS_EDIT' },
        { path: '/personalities', label: 'Bot Personalities', icon: '🧠', permission: 'BOT_PERSONALITIES_EDIT' },
        { path: '/messages', label: 'Messages', icon: '✉️', permission: 'MESSAGES_VIEW' },
        { path: '/server-health', label: 'Server Health', icon: '🏥', permission: 'SERVER_HEALTH_VIEW' },
        { path: '/image-manager', label: 'Image Manager', icon: '🎨', permission: 'IMAGEMANAGER_VIEW' },
    ];

    // Filter menu items based on permissions
    const visibleMenuItems = menuItems.filter(item => {
        if (isSuperAdmin) return true;
        // Check for VIEW or EDIT permission (EDIT implies VIEW access)
        const editPermission = item.permission.replace('_VIEW', '_EDIT');
        return permissions.includes(item.permission) || permissions.includes(editPermission);
    });

    return (
        <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <Link to="/dashboard" className="brand-logo">www.clicktory.in</Link>
                <button className="close-sidebar-btn md:hidden" onClick={toggleSidebar}>×</button>
            </div>

            <nav className="sidebar-nav">
                {visibleMenuItems.map(item => (
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
                <Link to="/settings" className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}>
                    <span className="icon">⚙️</span>
                    <span className="label">Settings</span>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
