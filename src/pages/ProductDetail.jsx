import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import KpiCard from '../components/KpiCard';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [prodRes, analRes] = await Promise.all([
                api.get(`/products/${id}`),
                api.get(`/products/${id}/analytics`)
            ]);
            setProduct(prodRes.data);
            setAnalytics(analRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAction = async (action) => {
        if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;

        try {
            setActionLoading(true);
            await api.post(`/products/${id}/${action}`);
            fetchData(); // Refresh data
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} product`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div>Loading product...</div>;
    if (!product) return <div>Product not found</div>;

    const renderOverview = () => (
        <div className="grid gap-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <KpiCard label="Total Clicks" value={product.stats.clicks_lifetime} subtitle={`${product.stats.clicks_today} today`} />
                <KpiCard label="Total Views" value={product.stats.views_lifetime} subtitle={`${product.stats.views_today} today`} />
                <KpiCard label="CTR" value={`${product.stats.ctr}%`} subtitle=" Lifetime" />
                <KpiCard label="Total Spend" value={product.stats.spend_lifetime} subtitle="Credits" />
            </div>

            <div className="card">
                <h3>Details</h3>
                <div className="grid gap-4 mt-4">
                    <div>
                        <strong>Tagline:</strong> {product.tagline}
                    </div>
                    <div>
                        <strong>Description:</strong>
                        <p style={{ marginTop: '4px', color: '#555', lineHeight: '1.5' }}>{product.description}</p>
                    </div>
                    <div>
                        <strong>Owner:</strong> <Link to={`/founders/${product.owner_user_id?._id}`} style={{ color: '#2563eb', marginLeft: '4px' }}>
                            {product.owner_user_id?.name || product.owner_user_id?.email || 'Unknown'}
                        </Link>
                    </div>
                    <div>
                        <strong>URL:</strong> <a href={product.website_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '4px', color: '#2563eb' }}>{product.website_url}</a>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="grid gap-6">
            <div className="card">
                <h3>Last 30 Days Activity</h3>
                <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                        <strong>Date</strong>
                        <strong>Views</strong>
                        <strong>Clicks</strong>
                    </div>
                    {analytics.views_history.map((viewDay, index) => {
                        const clickDay = analytics.clicks_history.find(c => c._id === viewDay._id);
                        return (
                            <div key={viewDay._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                <span>{viewDay._id}</span>
                                <span>{viewDay.count}</span>
                                <span>{clickDay ? clickDay.count : 0}</span>
                            </div>
                        );
                    })}
                    {analytics.views_history.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>No activity in last 30 days.</div>}
                </div>
            </div>

            <div className="card">
                <h3>Top Countries</h3>
                <div style={{ marginTop: '16px' }}>
                    {analytics.top_countries.map((country, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #fafafa' }}>
                            <span>{country._id || 'Unknown'}</span>
                            <strong>{country.count}</strong>
                        </div>
                    ))}
                    {analytics.top_countries.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>No data available.</div>}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link to="/products" className="btn-link">← Back to Products</Link>
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ marginBottom: '8px' }}>{product.name}</h1>
                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        background: product.status === 'approved' ? '#dcfce7' : product.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                        color: product.status === 'approved' ? '#166534' : product.status === 'rejected' ? '#991b1b' : '#854d0e',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                    }}>
                        {product.status.toUpperCase()}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {product.status !== 'approved' && (
                        <button
                            onClick={() => handleAction('approve')}
                            disabled={actionLoading}
                            className="btn"
                            style={{ background: '#10b981', color: 'white', border: 'none' }}
                        >
                            Approve
                        </button>
                    )}
                    {product.status !== 'rejected' && (
                        <button
                            onClick={() => handleAction('reject')}
                            disabled={actionLoading}
                            className="btn"
                            style={{ background: '#ef4444', color: 'white', border: 'none' }}
                        >
                            Reject
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px', gap: '24px' }}>
                {['overview', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #1a1a1a' : '2px solid transparent',
                            color: activeTab === tab ? '#1a1a1a' : '#6b7280',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab ? '600' : '500',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' ? renderOverview() : renderAnalytics()}
        </div>
    );
};

export default ProductDetail;
