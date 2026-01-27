import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
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
        fetchData();
    }, [id]);

    if (loading) return <div>Loading product...</div>;
    if (!product) return <div>Product not found</div>;

    const renderOverview = () => (
        <div className="card">
            <h3>Overview</h3>
            <div className="grid gap-4 mt-4">
                <div>
                    <strong>Tagline:</strong> {product.tagline}
                </div>
                <div>
                    <strong>Description:</strong>
                    <p style={{ marginTop: '4px', color: '#555' }}>{product.description}</p>
                </div>
                <div>
                    <strong>URL:</strong> <a href={product.website_url} target="_blank" rel="noopener noreferrer">{product.website_url}</a>
                </div>
                <div>
                    <strong>Metrics (Lifetime):</strong>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                        <span>👁️ {product.stats.views_lifetime} Views</span>
                        <span>🖱️ {product.stats.clicks_lifetime} Clicks</span>
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
                    {/* Simple text representation of chart data for now */}
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

            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>{product.name}</h1>
                <span style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    background: product.status === 'approved' ? '#d4edda' : '#fff3cd',
                    color: product.status === 'approved' ? '#155724' : '#856404',
                    fontWeight: 'bold'
                }}>
                    {product.status}
                </span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'overview' ? '2px solid #007bff' : '2px solid transparent',
                        color: activeTab === 'overview' ? '#007bff' : '#666',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'analytics' ? '2px solid #007bff' : '2px solid transparent',
                        color: activeTab === 'analytics' ? '#007bff' : '#666',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Analytics
                </button>
            </div>

            {activeTab === 'overview' ? renderOverview() : renderAnalytics()}
        </div>
    );
};

export default ProductDetail;
