import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/Newsletter/RichTextEditor';
import api from '../utils/api';

const NewsletterEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    const [formData, setFormData] = useState({
        title: '',
        html_content: '',
        text_content: '',
        slug: ''
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew) {
            fetchNewsletter();
        }
    }, [id]);

    const fetchNewsletter = async () => {
        try {
            const data = await api.get(`/admin/newsletters/${id}`);
            setFormData(data);
            setLoading(false);
        } catch (error) {
            console.error('Fetch error', error);
        }
    };

    const handleContentChange = (content) => {
        const text = content.replace(/<[^>]+>/g, ' ');
        setFormData(prev => ({
            ...prev,
            html_content: content,
            text_content: text
        }));
    };

    const handleSave = async (status = 'DRAFT') => {
        setSaving(true);
        try {
            const payload = { ...formData, status };

            let res;
            if (isNew) {
                res = await api.post('/admin/newsletters', payload);
                navigate(`/newsletters/${res._id}`);
            } else {
                await api.put(`/admin/newsletters/${id}`, payload);
            }
            alert('Saved successfully!');
        } catch (error) {
            console.error('Save error', error);
            alert('Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async () => {
        if (!window.confirm('Are you sure you want to SEND this newsletter to all active subscribers?')) return;
        setSaving(true);
        try {
            await api.post(`/admin/newsletters/${id}/send`);
            alert('Sending initiated!');
            navigate('/newsletters');
        } catch (error) {
            console.error('Send error', error);
            alert('Failed to send.');
            setSaving(false);
        }
    };

    const handlePreview = () => {
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <html>
                <head>
                    <title>Preview: ${formData.title}</title>
                    <style>
                        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; color: #111; }
                        img { max-width: 100%; height: auto; border-radius: 8px; }
                        h1 { font-size: 2.5em; margin-bottom: 0.5em; }
                    </style>
                </head>
                <body>
                    <h1>${formData.title}</h1>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    ${formData.html_content}
                </body>
            </html>
        `);
        previewWindow.document.close();
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-gray-400">Loading editor...</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col w-full">
            {/* Sticky Professional Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Untitled Story"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="text-2xl font-serif font-bold text-gray-900 border-none focus:ring-0 bg-transparent placeholder-gray-300 w-full p-0"
                    />
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                        {isNew ? 'New Draft' : `${formData.status || 'DRAFT'} • ${formData.slug || 'Using ID'}`}
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <button
                        onClick={handlePreview}
                        className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition"
                        title="Preview"
                    >
                        Preview
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button
                        onClick={() => handleSave('DRAFT')}
                        disabled={saving}
                        className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition"
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    {!isNew && (
                        <button
                            onClick={handleSend}
                            disabled={saving}
                            className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition shadow-sm flex items-center gap-2"
                        >
                            <span>Publish</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Editor Container - Full Width but readable center */}
            <div className="flex-1 w-full max-w-[1920px] mx-auto flex flex-col items-center">
                <div className="w-full h-full flex-1">
                    <RichTextEditor
                        value={formData.html_content}
                        onChange={handleContentChange}
                    />
                </div>
            </div>

            <style>{`
                .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid #f0f0f0 !important;
                    padding: 12px 32px !important;
                    position: sticky;
                    top: 73px; /* Below main header */
                    background: white;
                    z-index: 40;
                    text-align: center;
                }
                .ql-container.ql-snow {
                    border: none !important;
                    font-size: 1.125rem; /* 18px */
                }
                .ql-editor {
                    padding: 40px 10%; /* Responsive padding */
                    min-height: calc(100vh - 150px);
                    color: #292929;
                    font-family: 'Georgia', serif; /* Medium Style */
                }
                /* Wider editor on large screens */
                @media (min-width: 1400px) {
                    .ql-editor {
                        padding: 60px 20%;
                    }
                }
            `}</style>
        </div>
    );
};

export default NewsletterEditor;
