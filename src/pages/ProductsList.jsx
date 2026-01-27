import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/products?page=${page}&limit=20`);
            setProducts(res.data.products);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading products...</div>;

    return (
        <div className="card">
            <h2 style={{ marginBottom: '20px' }}>Products</h2>

            <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '12px' }}>Product</th>
                            <th style={{ padding: '12px' }}>Founder</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Traffic</th>
                            <th style={{ padding: '12px' }}>Clicks (Total)</th>
                            <th style={{ padding: '12px' }}>Created</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '12px' }}>
                                    <div><strong>{product.name}</strong></div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{product.tagline}</div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {product.owner?.name || product.owner?.email || 'Unknown'}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: product.status === 'approved' ? '#d4edda' : '#fff3cd',
                                        color: product.status === 'approved' ? '#155724' : '#856404',
                                        fontSize: '0.8rem'
                                    }}>
                                        {product.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>{product.traffic_enabled ? 'ON' : 'OFF'}</td>
                                <td style={{ padding: '12px' }}>{product.clicks_lifetime}</td>
                                <td style={{ padding: '12px' }}>{new Date(product.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>
                                    <Link to={`/products/${product._id}`} className="btn btn-sm btn-secondary">Details</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="btn btn-sm"
                    >
                        Previous
                    </button>
                    <span style={{ alignSelf: 'center' }}>Page {page} of {pagination.pages}</span>
                    <button
                        disabled={page === pagination.pages}
                        onClick={() => setPage(p => p + 1)}
                        className="btn btn-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductsList;
