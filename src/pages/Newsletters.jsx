import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import cronstrue from 'cronstrue';

const NewsletterDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, ai_settings
    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // AI Settings State
    const [aiSettings, setAiSettings] = useState({
        enabled: true,
        schedules: [
            { label: 'Daily Digest', cron: '0 9 * * *' }
        ],
        topicPrompt: 'Daily Product Discovery Tips & Trends',
        model: 'gemini-1.5-flash'
    });

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchNewsletters();
        } else if (activeTab === 'ai_settings') {
            fetchAiSettings();
        }
    }, [activeTab]);

    const fetchNewsletters = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/newsletters');
            setNewsletters(data.length ? data : []);
        } catch (error) {
            console.error('Failed to fetch newsletters', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAiSettings = async () => {
        try {
            const res = await api.get('/admin/config/ai');
            if (res && res.value) {
                setAiSettings({
                    ...res.value,
                    schedules: Array.isArray(res.value.schedules) ? res.value.schedules : []
                });
            }
        } catch (error) {
            console.error('Failed to fetch AI settings', error);
        }
    };

    const handleSaveAiSettings = async () => {
        setSaving(true);
        try {
            await api.put('/admin/config/ai', { value: aiSettings });
            alert('AI Configuration Saved & Schedules Updated');
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSchedule = () => {
        setAiSettings({
            ...aiSettings,
            schedules: [...aiSettings.schedules, { label: 'New Schedule', cron: '0 12 * * *' }]
        });
    };

    const handleRemoveSchedule = (index) => {
        const newSchedules = [...aiSettings.schedules];
        newSchedules.splice(index, 1);
        setAiSettings({ ...aiSettings, schedules: newSchedules });
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...aiSettings.schedules];
        newSchedules[index][field] = value;
        setAiSettings({ ...aiSettings, schedules: newSchedules });
    };

    const getCronDescription = (cronExp) => {
        try {
            return cronstrue.toString(cronExp);
        } catch (e) {
            return 'Invalid CRON';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Newsletter Campaigns</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage broadcasts and automated digest schedules.</p>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Tabs as pills */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'overview'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('ai_settings')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'ai_settings'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Auto-Pilot
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-2"></div>

                    <button
                        onClick={() => navigate('/newsletters/new')}
                        className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2"
                    >
                        <span>+</span> New Campaign
                    </button>
                </div>
            </div>

            {/* Main Content Full Width */}
            <div className="flex-1 w-full overflow-auto">
                {activeTab === 'overview' && (
                    <div className="w-full">
                        {loading ? (
                            <div className="p-12 text-center text-gray-400 animate-pulse">Loading campaigns...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                    <tr>
                                        <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Campaign</th>
                                        <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                                        <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                                        <th className="px-8 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {newsletters.map((newsletter) => (
                                        <tr key={newsletter._id} className="hover:bg-gray-50/50 transition group cursor-pointer" onClick={() => navigate(`/newsletters/${newsletter._id}`)}>
                                            <td className="px-8 py-4">
                                                <div className="font-medium text-gray-900 text-base">{newsletter.title || 'Untitled Draft'}</div>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                                    {newsletter.is_ai_generated && <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">AI</span>}
                                                    <span>Updated {new Date(newsletter.updatedAt || Date.now()).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${newsletter.status === 'SENT' ? 'bg-green-50 text-green-700' :
                                                        newsletter.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-gray-100 text-gray-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${newsletter.status === 'SENT' ? 'bg-green-500' :
                                                        newsletter.status === 'SCHEDULED' ? 'bg-amber-500' :
                                                            'bg-gray-400'
                                                        }`}></span>
                                                    {newsletter.status.charAt(0) + newsletter.status.slice(1).toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                {newsletter.status === 'SENT' ? (
                                                    <div className="flex items-center gap-6">
                                                        <div>
                                                            <div className="text-lg font-semibold text-gray-900">{newsletter.stats.sent_count}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Sent</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-semibold text-gray-900">{newsletter.stats.open_count}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Opens</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-4 text-sm text-gray-500">
                                                {newsletter.scheduled_at
                                                    ? new Date(newsletter.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                    : <span className="text-gray-400 text-xs">Not scheduled</span>}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <span className="text-gray-300 group-hover:text-gray-600 transition">Edit →</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {newsletters.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-24 text-center">
                                                <div className="inline-block p-4 bg-gray-50 rounded-full mb-4 text-2xl">✍️</div>
                                                <h3 className="text-sm font-medium text-gray-900">No campaigns yet</h3>
                                                <button onClick={() => navigate('/newsletters/new')} className="mt-2 text-indigo-600 text-sm hover:underline">Start writing</button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'ai_settings' && (
                    <div className="w-full max-w-5xl mx-auto px-8 py-12">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Auto-Pilot Configuration</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure automated content generation parameters.</p>
                            </div>
                            <button
                                onClick={handleSaveAiSettings}
                                disabled={saving}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Prompt & Model */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">System Prompt & Topic</label>
                                    <textarea
                                        value={aiSettings.topicPrompt}
                                        onChange={(e) => setAiSettings({ ...aiSettings, topicPrompt: e.target.value })}
                                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[140px] text-sm leading-relaxed text-gray-700 resize-none bg-gray-50 focus:bg-white transition"
                                        placeholder="Describe the persona and topic..."
                                    />
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">AI Model</label>
                                        <p className="text-xs text-gray-400 mt-1">Select the reasoning engine.</p>
                                    </div>
                                    <select
                                        value={aiSettings.model}
                                        onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                                        className="p-2 pr-8 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium focus:ring-indigo-500"
                                    >
                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</option>
                                        <option value="gemini-2.0-flash-lite-001">Gemini 2.0 Flash Lite (Efficient)</option>
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Latest)</option>
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column: Schedules */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedules</h3>
                                        <button onClick={handleAddSchedule} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                                            + Add
                                        </button>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {aiSettings.schedules.map((schedule, index) => (
                                            <div key={index} className="p-5 hover:bg-gray-50 transition relative group">
                                                <button
                                                    onClick={() => handleRemoveSchedule(index)}
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                                                >
                                                    ×
                                                </button>

                                                <div className="mb-3">
                                                    <input
                                                        type="text"
                                                        value={schedule.label}
                                                        onChange={(e) => handleScheduleChange(index, 'label', e.target.value)}
                                                        className="block w-full text-sm font-medium text-gray-900 border-none p-0 focus:ring-0 bg-transparent placeholder-gray-400 mb-1"
                                                        placeholder="Morning Digest"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CRON</span>
                                                        <input
                                                            type="text"
                                                            value={schedule.cron}
                                                            onChange={(e) => handleScheduleChange(index, 'cron', e.target.value)}
                                                            className="block w-full text-xs font-mono text-gray-600 border-none p-0 focus:ring-0 bg-transparent"
                                                            placeholder="0 9 * * *"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="text-xs text-green-600 bg-green-50 inline-block px-2 py-1 rounded font-medium">
                                                    {getCronDescription(schedule.cron)}
                                                </div>
                                            </div>
                                        ))}
                                        {aiSettings.schedules.length === 0 && (
                                            <div className="p-8 text-center text-gray-400 text-xs">No active schedules.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsletterDashboard;
