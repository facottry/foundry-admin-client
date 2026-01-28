import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const FoundersList = () => {
    const [founders, setFounders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchFounders();
    }, [page, debouncedSearch, sortBy, sortOrder]);

    const fetchFounders = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/users`, {
                params: {
                    role: 'FOUNDER',
                    page,
                    limit: 20,
                    search: debouncedSearch,
                    sortBy,
                    order: sortOrder
                }
            });
            setFounders(res.data.users);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading founders...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0 }}>Founders</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search founders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            width: '240px'
                        }}
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="created_at">Joined Date</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="credits_balance">Balance</option>
                        <option value="products_count">Products</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            background: '#f9f9f9',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            minWidth: '40px'
                        }}
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Products</th>
                            <th style={{ padding: '12px' }}>Balance</th>
                            <th style={{ padding: '12px' }}>Joined</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {founders.map(user => (
                            <tr key={user._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '12px' }}>{user.name}</td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>{user.products_count}</td>
                                <td style={{ padding: '12px' }}>{user.credits_balance}</td>
                                <td style={{ padding: '12px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>
                                    <Link to={`/founders/${user._id}`} className="btn btn-sm btn-secondary">View</Link>
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

export default FoundersList;
