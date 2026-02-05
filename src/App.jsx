import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import DashboardAdmin from './pages/DashboardAdmin';
import FoundersList from './pages/FoundersList';
import FounderDetail from './pages/FounderDetail';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import InfrastructureSettings from './pages/InfrastructureSettings';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Newsletters from './pages/Newsletters';
import NewsletterEditor from './pages/NewsletterEditor';
import Personalities from './pages/Personalities';
import ServerHealth from './pages/ServerHealth';
import ImageManager from './pages/ImageManager';
import AIJobs from './pages/AIJobs';
import AIJobForm from './pages/AIJobForm';
import AIJobDetail from './pages/AIJobDetail';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<AdminLogin />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Protected Routes wrapped in AdminLayout */}
                    <Route element={<AdminLayout />}>
                        <Route path="/dashboard" element={<DashboardAdmin />} />
                        <Route path="/founders" element={<FoundersList />} />
                        <Route path="/founders/:id" element={<FounderDetail />} />
                        <Route path="/products" element={<ProductsList />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/settings/infrastructure" element={<Navigate to="/settings" replace />} />
                        <Route path="/change-password" element={<ChangePassword />} />

                        <Route path="/newsletters" element={<Newsletters />} />
                        <Route path="/newsletters/:id" element={<NewsletterEditor />} /> {/* :id can be 'new' */}
                        <Route path="/personalities" element={<Personalities />} />
                        <Route path="/server-health" element={<ServerHealth />} />
                        <Route path="/image-manager" element={<ImageManager />} />
                        <Route path="/ai-jobs" element={<AIJobs />} />
                        <Route path="/ai-jobs/new" element={<AIJobForm />} />
                        <Route path="/ai-jobs/:id" element={<AIJobDetail />} />
                        <Route path="/ai-jobs/:id/edit" element={<AIJobForm />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
