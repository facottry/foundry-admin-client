import React from 'react';

const LoadingState = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #333',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
        }}></div>
        <p style={{ color: '#666' }}>Loading...</p>
        <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
    </div>
);

export default LoadingState;
