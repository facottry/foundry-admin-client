import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const AIJobForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState('DAILY');
    const [time, setTime] = useState('10:00');
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [customCron, setCustomCron] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [aiModel, setAiModel] = useState('gemini-2.0-flash');
    const [autoSend, setAutoSend] = useState(false);
    const [subjectTemplate, setSubjectTemplate] = useState('{{title}}');
    const [activateOnSave, setActivateOnSave] = useState(false);

    // Preview state
    const [previewing, setPreviewing] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchJob();
        }
    }, [id]);

    const fetchJob = async () => {
        try {
            const res = await api.get(`/admin/ai-jobs/${id}`);
            const job = res.data || res;
            setName(job.name || '');
            setFrequency(job.schedule?.frequency || 'DAILY');
            setTime(job.schedule?.time || '10:00');
            setDayOfWeek(job.schedule?.dayOfWeek || 1);
            setCustomCron(job.schedule?.customCron || '');
            setSystemPrompt(job.config?.systemPrompt || '');
            setAiModel(job.config?.aiModel || 'gemini-2.0-flash');
            setAutoSend(job.config?.autoSend || false);
            setSubjectTemplate(job.config?.subjectTemplate || '{{title}}');
        } catch (err) {
            console.error(err);
            setNotification({ msg: 'Failed to load job', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const showNotify = (msg, type = 'info') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) return showNotify('Job name is required', 'error');
        if (!systemPrompt.trim()) return showNotify('System prompt is required', 'error');

        setSaving(true);

        try {
            const payload = {
                name,
                status: activateOnSave ? 'ACTIVE' : 'PAUSED',
                schedule: {
                    frequency,
                    time: frequency !== 'CUSTOM' ? time : undefined,
                    dayOfWeek: frequency === 'WEEKLY' ? dayOfWeek : undefined,
                    customCron: frequency === 'CUSTOM' ? customCron : undefined,
                    timezone: 'Asia/Kolkata'
                },
                config: {
                    systemPrompt,
                    aiModel,
                    autoSend,
                    subjectTemplate
                }
            };

            if (isEdit) {
                await api.put(`/admin/ai-jobs/${id}`, payload);
                showNotify('Job updated', 'success');
            } else {
                await api.post('/admin/ai-jobs', payload);
                showNotify('Job created', 'success');
            }

            setTimeout(() => navigate('/ai-jobs'), 500);
        } catch (err) {
            console.error(err);
            showNotify(err.message || 'Failed to save job', 'error');
        } finally {
            setSaving(false);
        }
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handlePreview = async () => {
        if (!systemPrompt.trim()) return showNotify('System prompt is required for preview', 'error');
        setPreviewing(true);
        try {
            const res = await api.post('/admin/ai-jobs/preview', { systemPrompt, aiModel });
            const data = res.data || res;
            setPreviewContent(data);
            setShowPreviewModal(true);
        } catch (err) {
            showNotify(err.message || 'Preview failed', 'error');
        } finally {
            setPreviewing(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail.trim()) return showNotify('Enter an email address', 'error');
        if (!previewContent) return showNotify('Generate a preview first', 'error');
        setSendingTest(true);
        try {
            await api.post('/admin/ai-jobs/test-email', {
                email: testEmail,
                subject: previewContent.title || 'Newsletter Preview',
                html_content: previewContent.html_content,
                text_content: previewContent.text_content
            });
            showNotify(`Test email sent to ${testEmail}`, 'success');
        } catch (err) {
            showNotify(err.message || 'Failed to send test email', 'error');
        } finally {
            setSendingTest(false);
        }
    };

    const handleFrequencyChange = (e) => {
        const val = e.target.value;
        setFrequency(val);
        if (val === 'CUSTOM' && !customCron) {
            setCustomCron('0 * * * *'); // Default: Every hour
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white font-medium`}>
                    {notification.msg}
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate('/ai-jobs')} className="text-blue-600 hover:text-blue-700 text-sm mb-2">
                        ← Back to Jobs
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Job' : 'New AI Job'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Job Basics */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Basics</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g., Daily Product Digest"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                                <input
                                    type="text"
                                    value="Newsletter"
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                {/* ... (inside render) */}
                                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                <select
                                    value={frequency}
                                    onChange={handleFrequencyChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="DAILY">Daily</option>
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="CUSTOM">Custom CRON</option>
                                </select>
                            </div>
                            {frequency !== 'CUSTOM' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={e => setTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            )}
                            {frequency === 'WEEKLY' && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                                    <select
                                        value={dayOfWeek}
                                        onChange={e => setDayOfWeek(parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        {days.map((day, i) => (
                                            <option key={i} value={i}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {frequency === 'CUSTOM' && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CRON Expression</label>
                                    <input
                                        type="text"
                                        value={customCron}
                                        onChange={e => setCustomCron(e.target.value)}
                                        placeholder="*/5 * * * *"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Format: minute hour day month weekday. Examples: <code>*/5 * * * *</code> (every 5 min), <code>0 9 * * 1-5</code> (9am weekdays)
                                    </p>
                                </div>
                            )}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                <input
                                    type="text"
                                    value="Asia/Kolkata (IST)"
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Generate */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Generate Newsletter</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt / Topic</label>
                                <textarea
                                    value={systemPrompt}
                                    onChange={e => setSystemPrompt(e.target.value)}
                                    rows={6}
                                    placeholder="Describe the newsletter topic and instructions for the AI..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                                <select
                                    value={aiModel}
                                    onChange={e => setAiModel(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <optgroup label="Gemini">
                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</option>
                                        <option value="gemini-2.0-flash-lite-001">Gemini 2.0 Flash Lite (Efficient)</option>
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Latest)</option>
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Reasoning)</option>
                                    </optgroup>
                                    <optgroup label="OpenAI">
                                        <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                                        <option value="gpt-4o">GPT-4o (Quality)</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    disabled={previewing || !systemPrompt.trim()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {previewing ? 'Generating Preview...' : '⚡ Preview Generation'}
                                </button>
                                <p className="text-xs text-gray-400 mt-1">Generate content without saving to test your prompt</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Publish */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Publish Newsletter</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="autoSend"
                                    checked={autoSend}
                                    onChange={e => setAutoSend(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="autoSend" className="text-sm font-medium text-gray-700">
                                    Auto-send after generation
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Template</label>
                                <input
                                    type="text"
                                    value={subjectTemplate}
                                    onChange={e => setSubjectTemplate(e.target.value)}
                                    placeholder="{{title}}"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                                <p className="text-xs text-gray-400 mt-1">Use {"{{title}}"} for dynamic title</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                                <input
                                    type="text"
                                    value="All Subscribers"
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/ai-jobs')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => { setActivateOnSave(true); document.querySelector('form').requestSubmit(); }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save & Activate'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Preview Modal */}
            {showPreviewModal && previewContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Preview: {previewContent.title}</h3>
                            <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewContent.html_content }} />
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={e => setTestEmail(e.target.value)}
                                    placeholder="test@example.com"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                />
                                <button
                                    onClick={handleTestEmail}
                                    disabled={sendingTest || !testEmail.trim()}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                    {sendingTest ? 'Sending...' : '📧 Send Test Email'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Send a test email to verify the content before activating</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIJobForm;
