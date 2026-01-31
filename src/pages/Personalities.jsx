import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Personalities = () => {
    const [personalities, setPersonalities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPersonality, setEditingPersonality] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        tone: '',
        greeting: '',
        defaultMode: ''
    });

    useEffect(() => {
        fetchPersonalities();
    }, []);

    const fetchPersonalities = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/personalities');
            setPersonalities(response);
            setError(null);
        } catch (err) {
            setError('Failed to fetch personalities');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, defaultMode: formData.defaultMode || null };
        try {
            if (editingPersonality) {
                await api.put(`/admin/personalities/${editingPersonality._id}`, payload);
            } else {
                await api.post('/admin/personalities', payload);
            }
            setShowModal(false);
            setEditingPersonality(null);
            setFormData({ name: '', tone: '', greeting: '', defaultMode: '' });
            fetchPersonalities();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save personality');
        }
    };

    const handleEdit = (personality) => {
        setEditingPersonality(personality);
        setFormData({
            name: personality.name,
            tone: personality.tone,
            greeting: personality.greeting,
            defaultMode: personality.defaultMode || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this personality?')) return;
        try {
            await api.delete(`/admin/personalities/${id}`);
            fetchPersonalities();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete personality');
        }
    };

    const handleActivate = async (id) => {
        try {
            await api.put(`/admin/personalities/${id}/activate`);
            fetchPersonalities();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to activate personality');
        }
    };

    const openNewModal = () => {
        setEditingPersonality(null);
        setFormData({ name: '', tone: '', greeting: '', defaultMode: '' });
        setShowModal(true);
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Bot Personalities</h1>
                <button
                    onClick={openNewModal}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    + New Personality
                </button>
            </div>

            <p className="text-gray-600 mb-6">
                Create and manage Clicky's personalities. Assign default modes for Mini (AIRA) vs Full (REX).
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(personalities || []).map(p => (
                    <div
                        key={p._id}
                        className={`bg-white rounded-lg shadow p-5 border-2 ${p.isActive ? 'border-green-500' : 'border-transparent'}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-semibold">{p.name}</h3>
                                {p.defaultMode && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${p.defaultMode === 'mini' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {p.defaultMode === 'mini' ? 'Mini Mode (Default)' : 'Full Mode (Default)'}
                                    </span>
                                )}
                            </div>
                            {p.isActive && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                    Active Legacy
                                </span>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="text-xs text-gray-500 uppercase">Greeting</label>
                            <p className="text-sm text-gray-700 line-clamp-2">{p.greeting}</p>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs text-gray-500 uppercase">Tone</label>
                            <p className="text-sm text-gray-600 line-clamp-3">{p.tone}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => handleEdit(p)}
                                className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-300"
                            >
                                Edit
                            </button>
                            {!p.isActive && (
                                <button
                                    onClick={() => handleDelete(p._id)}
                                    className="bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded hover:bg-red-200"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {(!personalities || personalities.length === 0) && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 mb-4">No personalities created yet.</p>
                        <button
                            onClick={openNewModal}
                            className="text-indigo-600 hover:underline"
                        >
                            Create your first personality
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">
                            {editingPersonality ? 'Edit Personality' : 'New Personality'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="e.g., AIRA, REX"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Default Mode Assignment
                                </label>
                                <select
                                    value={formData.defaultMode}
                                    onChange={e => setFormData({ ...formData, defaultMode: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 bg-white"
                                >
                                    <option value="">None (Manual Select only)</option>
                                    <option value="mini">Mini Mode (AIRA default)</option>
                                    <option value="full">Full Mode (REX default)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">If set, this personality will be used automatically for the selected mode.</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Greeting Message
                                </label>
                                <input
                                    type="text"
                                    value={formData.greeting}
                                    onChange={e => setFormData({ ...formData, greeting: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="Hello! I'm Clicky..."
                                    required
                                    maxLength={500}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tone Instructions
                                </label>
                                <textarea
                                    value={formData.tone}
                                    onChange={e => setFormData({ ...formData, tone: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 h-32"
                                    placeholder="Describe response style..."
                                    required
                                    maxLength={2000}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                >
                                    {editingPersonality ? 'Save Changes' : 'Create Personality'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Personalities;
