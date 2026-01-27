import React from 'react';

const EmptyState = ({ title = 'Nothing here yet', subtext = 'Data will appear once available.', action }) => (
    <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
        <h3>{title}</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>{subtext}</p>
        {action}
    </div>
);

export default EmptyState;
