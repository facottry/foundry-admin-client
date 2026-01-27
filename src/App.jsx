import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminLogin from './pages/AdminLogin';
import DashboardAdmin from './pages/DashboardAdmin';
import FoundersList from './pages/FoundersList';
import FounderDetail from './pages/FounderDetail';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import Messages from './pages/Messages';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <div className="container">
                    <Routes>
                        <Route path="/login" element={<AdminLogin />} />
                        <Route path="/dashboard" element={<DashboardAdmin />} />
                        <Route path="/founders" element={<FoundersList />} />
                        <Route path="/founders/:id" element={<FounderDetail />} />
                        <Route path="/products" element={<ProductsList />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
