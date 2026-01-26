import React from 'react';

const ErrorState = ({ error, onRetry }) => (
    <div className="card" style={{ textAlign: 'center', padding: '40px', borderColor: '#ffcdd2' }}>
        <h3 style={{ color: '#d32f2f' }}>Error</h3>
        <p style={{ color: '#333' }}>{error?.message || 'Something went wrong.'}</p>
        {onRetry && (
            <button onClick={onRetry} className="btn btn-primary" style={{ marginTop: '20px' }}>
                Retry
            </button>
        )}
    </div>
);

export default ErrorState;
