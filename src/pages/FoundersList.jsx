import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const FoundersList = () => {
    const [founders, setFounders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchFounders();
    }, [page]);

    const fetchFounders = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/users?role=FOUNDER&page=${page}&limit=20`);
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
            <h2 style={{ marginBottom: '20px' }}>Founders</h2>

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
