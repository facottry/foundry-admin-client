import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const InfrastructureSettings = () => {
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/admin/config');
            setConfig(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSave = async (key, value) => {
        try {
            if (key === 'TRACK_SERVER_BASE_URL') {
                if (value && !value.startsWith('http')) {
                    alert('URL must start with http:// or https://');
                    return;
                }
            }

            const res = await api.post('/admin/config', { key, value });
            setConfig(prev => ({ ...prev, [key]: value }));
            setMessage('Saved successfully');
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card">
            <h2>Infrastructure Settings</h2>

            {message && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '20px' }}>{message}</div>}

            <div style={{ marginTop: '30px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Track Server Endpoint</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            value={config['TRACK_SERVER_BASE_URL'] || ''}
                            onChange={(e) => setConfig({ ...config, 'TRACK_SERVER_BASE_URL': e.target.value })}
                            placeholder="https://track.example.com"
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSave('TRACK_SERVER_BASE_URL', config['TRACK_SERVER_BASE_URL'])}
                        >
                            Save
                        </button>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>
                        The base URL for the high-performance tracking server. CAUTION: Changing this affects all tracking pixels immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfrastructureSettings;
