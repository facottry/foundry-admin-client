import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const FounderDetail = () => {
    const { id } = useParams();
    const [founder, setFounder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFounder = async () => {
            try {
                const res = await api.get(`/users/${id}`);
                setFounder(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFounder();
    }, [id]);

    if (loading) return <div>Loading founder...</div>;
    if (!founder) return <div>Founder not found</div>;

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link to="/founders" className="btn-link">← Back to Founders</Link>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0 }}>{founder.name}</h1>
                        <div style={{ color: '#666' }}>{founder.email}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{founder.credits_balance}</div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888' }}>Credits</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Products</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{founder.products_owned}</div>
                    </div>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Clicks</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{founder.total_clicks_generated}</div>
                    </div>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Spend</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{founder.total_spend || 0}</div>
                    </div>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Joined</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{new Date(founder.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            {/* Additional sections for products list could go here, but omitted for brevity in this step 
                User can view products in the main Products list filtered by founder if we implemented filtering there,
                or we could list them here.
            */}
        </div>
    );
};

export default FounderDetail;
