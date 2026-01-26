import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ReplyModal from '../components/ReplyModal';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ tag: '', status: '', priority: '' });
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.tag) params.append('tag', filter.tag);
            if (filter.status) params.append('status', filter.status);
            if (filter.priority) params.append('priority', filter.priority);

            const res = await api.get(`/admin/messages?${params.toString()}`);
            setMessages(res.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [filter]);

    const handleReply = (message) => {
        setSelectedMessage(message);
        setShowReplyModal(true);
    };

    const handleReplySent = () => {
        setShowReplyModal(false);
        setSelectedMessage(null);
        fetchMessages();
    };

    const getTagColor = (tag) => {
        const colors = {
            'urgent': '#ef4444',
            'feature-request': '#3b82f6',
            'bug-report': '#f59e0b',
            'question': '#8b5cf6',
            'feedback': '#10b981',
            'partnership': '#ec4899',
            'other': '#6b7280'
        };
        return colors[tag] || '#6b7280';
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            high: { bg: '#fef2f2', color: '#991b1b', label: 'High' },
            medium: { bg: '#fef9c3', color: '#854d0e', label: 'Medium' },
            low: { bg: '#f0fdf4', color: '#166534', label: 'Low' }
        };
        const style = styles[priority] || styles.medium;
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: style.bg,
                color: style.color
            }}>
                {style.label}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            new: { bg: '#dbeafe', color: '#1e40af', label: 'New' },
            read: { bg: '#e0e7ff', color: '#3730a3', label: 'Read' },
            replied: { bg: '#d1fae5', color: '#065f46', label: 'Replied' },
            archived: { bg: '#f3f4f6', color: '#374151', label: 'Archived' }
        };
        const style = styles[status] || styles.new;
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: style.bg,
                color: style.color
            }}>
                {style.label}
            </span>
        );
    };

    return (
        <div style={{ padding: '30px 40px', background: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px' }}>
                    Contact Messages
                </h1>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>
                    View and respond to customer inquiries
                </p>
            </div>

            {/* Filters */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                            Tag
                        </label>
                        <select
                            value={filter.tag}
                            onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E5E5' }}
                        >
                            <option value="">All Tags</option>
                            <option value="urgent">Urgent</option>
                            <option value="feature-request">Feature Request</option>
                            <option value="bug-report">Bug Report</option>
                            <option value="question">Question</option>
                            <option value="feedback">Feedback</option>
                            <option value="partnership">Partnership</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                            Status
                        </label>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E5E5' }}
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                            Priority
                        </label>
                        <select
                            value={filter.priority}
                            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E5E5' }}
                        >
                            <option value="">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setFilter({ tag: '', status: '', priority: '' })}
                        style={{
                            padding: '8px 16px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginTop: '24px'
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Messages List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Loading messages...
                </div>
            ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No messages found
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #E5E5E5',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleReply(msg)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                                            {msg.subject}
                                        </h3>
                                        {getPriorityBadge(msg.priority)}
                                        {getStatusBadge(msg.status)}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                                        From: <strong>{msg.name}</strong> ({msg.email})
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
                                        {msg.message.substring(0, 150)}{msg.message.length > 150 ? '...' : ''}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {msg.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: getTagColor(tag) + '20',
                                                    color: getTagColor(tag)
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#999', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showReplyModal && selectedMessage && (
                <ReplyModal
                    message={selectedMessage}
                    onClose={() => setShowReplyModal(false)}
                    onReplySent={handleReplySent}
                />
            )}
        </div>
    );
};

export default Messages;
