import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, promoted }) => {
    // Logic for disabled button will be in ProductDetails mostly, but if here:
    // We need to know if we can visit.
    // For now, standard link.

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {promoted && <span className="promoted-badge">Promoted</span>}
                <h3 style={{ margin: 0 }}>{product.name}</h3>
            </div>
            <p style={{ color: '#666', margin: '5px 0' }}>{product.tagline}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '0.9rem', background: '#eee', padding: '2px 8px', borderRadius: '4px' }}>
                    {product.categories && product.categories[0]}
                </span>
                <Link to={`/product/${product._id}`} className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
