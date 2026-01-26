import React from 'react';

const StatTable = ({ title, columns, data, emptyMessage = 'No data available' }) => {
    return (
        <div style={{
            background: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E5E5E5',
                background: '#fafafa'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#1a1a1a'
                }}>
                    {title}
                </h3>
            </div>
            <div style={{ padding: '0' }}>
                {data && data.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #E5E5E5' }}>
                                {columns.map((col, idx) => (
                                    <th key={idx} style={{
                                        padding: '12px 20px',
                                        textAlign: col.align || 'left',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        color: '#666',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIdx) => (
                                <tr key={rowIdx} style={{
                                    borderBottom: rowIdx < data.length - 1 ? '1px solid #f0f0f0' : 'none'
                                }}>
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} style={{
                                            padding: '14px 20px',
                                            fontSize: '0.9rem',
                                            color: '#1a1a1a',
                                            textAlign: col.align || 'left'
                                        }}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#999',
                        fontSize: '0.9rem'
                    }}>
                        {emptyMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatTable;
