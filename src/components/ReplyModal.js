import React, { useState } from 'react';
import api from '../utils/api';

const ReplyModal = ({ message, onClose, onReplySent }) => {
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    const handleSend = async () => {
        if (!reply.trim()) {
            setError('Please enter a reply');
            return;
        }

        try {
            setSending(true);
            setError(null);
            await api.post(`/admin/messages/${message._id}/reply`, { reply });
            onReplySent();
        } catch (err) {
            setError(err.message || 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                maxWidth: '700px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Reply to Message</h2>

                {/* Original Message */}
                <div style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #E5E5E5'
                }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                        <strong>From:</strong> {message.name} ({message.email})
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                        <strong>Subject:</strong> {message.subject}
                    </div>
                    <div style={{ fontSize: '0.9rem', marginTop: '12px', lineHeight: '1.6' }}>
                        {message.message}
                    </div>
                </div>

                {/* Reply Input */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>
                        Your Reply
                    </label>
                    <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={8}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #E5E5E5',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#fef2f2',
                        color: '#991b1b',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        disabled={sending}
                        style={{
                            padding: '10px 20px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: sending ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        style={{
                            padding: '10px 24px',
                            background: sending ? '#ccc' : '#1a1a1a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: sending ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600'
                        }}
                    >
                        {sending ? 'Sending...' : 'Send Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReplyModal;
