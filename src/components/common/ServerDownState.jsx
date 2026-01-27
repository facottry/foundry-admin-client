import React from 'react';

const ServerDownState = ({ onRetry }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255,255,255,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
            <h2>Service temporarily unavailable</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Please try again in a moment.</p>
            <button onClick={onRetry} className="btn btn-primary">Retry</button>
        </div>
    </div>
);

export default ServerDownState;
