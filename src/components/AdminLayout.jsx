import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AuthContext from '../context/AuthContext';

const AdminLayout = () => {
    const { logout } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="admin-layout">
            {/* Mobile Header */}
            <header className="mobile-header md:hidden">
                <button onClick={toggleSidebar} className="hamburger-btn">
                    ☰
                </button>
                <span className="brand-logo-mobile">www.clicktory.in</span>
            </header>

            <div className="layout-content">
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    logout={logout}
                />

                <main className="main-content">
                    <div className="container-fluid">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    );
};

export default AdminLayout;
