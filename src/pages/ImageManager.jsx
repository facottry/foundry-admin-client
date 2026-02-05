import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ImageManager = () => {
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

    // New Job State
    const [intent, setIntent] = useState('');
    const [prompt, setPrompt] = useState(''); // Raw prompt initially, then refined
    const [finalPrompt, setFinalPrompt] = useState('');
    const [imageCount, setImageCount] = useState(1);
    const [size, setSize] = useState('1024x1024');
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    // History State
    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Date Filters (YYYY-MM-DD format, local timezone)
    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const [fromDate, setFromDate] = useState(getTodayStr());
    const [toDate, setToDate] = useState(getTodayStr());

    // Path relative to api.js baseURL (http://localhost:5001/api)
    const API_PATH = '/admin/image';

    // Fetch enabled models on mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await api.get(`${API_PATH}/models`);
                const modelList = res.data || res || [];
                setModels(modelList);
                if (modelList.length > 0) {
                    setSelectedModel(modelList[0].key); // Default to lowest cost
                }
            } catch (err) {
                console.error('Failed to fetch models:', err);
            }
        };
        fetchModels();
    }, []);

    // --- Actions ---

    const handleEnhance = async () => {
        if (!prompt) return showNotify('Please enter a prompt info first', 'error');

        setIsEnhancing(true);
        try {
            const res = await api.post(`${API_PATH}/enhance-prompt`, { intent, prompt });
            setFinalPrompt(res.data?.finalPrompt || res.finalPrompt);
            showNotify('Prompt enhanced successfully!', 'success');
        } catch (err) {
            console.error(err);
            showNotify(err.message || 'Failed to enhance prompt', 'error');
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleExecute = async () => {
        if (!finalPrompt) return showNotify('Please enhance or enter a final prompt', 'error');

        setIsSubmitting(true);
        try {
            const res = await api.post(`${API_PATH}/execute-prompt`, {
                intent,
                rawPrompt: prompt,
                finalPrompt,
                imageCount,
                size,
                modelKey: selectedModel
            });

            const jobId = res.data?.jobId || res.jobId;
            showNotify(`Job Started! ID: ${jobId}`, 'success');
            // Reset form
            setIntent('');
            setPrompt('');
            setFinalPrompt('');
            setImageCount(1);
            // Switch to history
            setActiveTab('history');
            fetchJobs();
        } catch (err) {
            console.error(err);
            showNotify(err.message || 'Failed to start job', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Delete this job? This cannot be undone.')) return;
        try {
            await api.delete(`${API_PATH}/job/${jobId}`);
            setJobs(prev => prev.filter(j => j.jobId !== jobId));
            showNotify('Job deleted', 'success');
        } catch (err) {
            showNotify('Failed to delete job', 'error');
        }
    };

    // Date Validation
    const MIN_DATE = '2026-01-01';
    const MAX_RANGE_DAYS = 30;

    const validateDates = () => {
        const today = getTodayStr();
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const min = new Date(MIN_DATE);
        const todayDate = new Date(today);

        if (fromDate < MIN_DATE) return { valid: false, msg: 'From date cannot be before 1 Jan 2026' };
        if (toDate > today) return { valid: false, msg: 'To date cannot be in the future' };
        if (from > to) return { valid: false, msg: 'From date cannot be after To date' };
        const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
        if (diffDays > MAX_RANGE_DAYS) return { valid: false, msg: `Date range cannot exceed ${MAX_RANGE_DAYS} days` };
        return { valid: true };
    };

    const fetchJobs = async () => {
        const validation = validateDates();
        if (!validation.valid) {
            showNotify(validation.msg, 'error');
            return;
        }

        setLoadingJobs(true);
        setHasFetched(true);
        try {
            const res = await api.get(`${API_PATH}/job-list?from=${fromDate}&to=${toDate}`);
            // api.js returns response.data which is { success, data }
            const jobsData = res?.data || res || [];
            setJobs(Array.isArray(jobsData) ? jobsData : []);
        } catch (err) {
            console.error(err);
            setJobs([]);
        } finally {
            setLoadingJobs(false);
        }
    };

    const showNotify = (msg, type) => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // No auto-fetch - user must click Fetch button

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Image Manager</h1>
                    <p className="text-gray-500 mt-1">Generate and manage AI assets for your products</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        New Generator
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Job History
                    </button>
                </div>
            </div>

            {notification && (
                <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    <span>{notification.msg}</span>
                    <button onClick={() => setNotification(null)} className="font-bold">&times;</button>
                </div>
            )}

            {/* --- NEW JOB TAB --- */}
            {activeTab === 'new' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-800">Create New Asset Job</h2>
                        <p className="text-sm text-gray-500">Define your intent and let AI refine the prompt.</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Inputs */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Intent / Concept</label>
                                <input
                                    type="text"
                                    value={intent}
                                    onChange={e => setIntent(e.target.value)}
                                    placeholder="e.g. Analytics Dashboard for FinTech"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Raw Details</label>
                                <textarea
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    placeholder="Describe colors, elements, mood..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleEnhance}
                                disabled={isEnhancing || !prompt}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${isEnhancing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                            >
                                {isEnhancing ? '✨ Refining Prompt with AI...' : '✨ Enhance Prompt'}
                            </button>
                        </div>

                        {/* Right: Review */}
                        <div className="space-y-6 bg-gray-50/50 p-6 rounded-xl border border-dashed border-gray-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Final Prompt (Editable)</label>
                                <textarea
                                    value={finalPrompt}
                                    onChange={e => setFinalPrompt(e.target.value)}
                                    placeholder="Enhanced prompt will appear here. You can edit it before generation."
                                    rows={8}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white font-mono text-sm leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                {models.length > 0 && (
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                        <select
                                            value={selectedModel}
                                            onChange={e => setSelectedModel(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white font-medium"
                                        >
                                            {models.map(m => (
                                                <option key={m.key} value={m.key}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                                    <select
                                        value={size}
                                        onChange={e => setSize(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                                    >
                                        <option value="1024x1024">Auto (Square 1:1)</option>
                                        <option value="1024x1024">Square (1024×1024)</option>
                                        <option value="1792x1024">Landscape (1792×1024)</option>
                                        <option value="1024x1792">Portrait (1024×1792)</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Count (1-5)</label>
                                    <select
                                        value={imageCount}
                                        onChange={e => setImageCount(parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleExecute}
                                disabled={!finalPrompt || isSubmitting}
                                className={`w-full py-2.5 mt-4 rounded-lg font-semibold text-white transition-all ${!finalPrompt || isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'}`}
                            >
                                {isSubmitting ? '🚀 Queuing Job...' : '🚀 Generate Images'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HISTORY TAB --- */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h2 className="text-lg font-semibold text-gray-800">Job History</h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">From:</label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={e => setFromDate(e.target.value)}
                                        min="2026-01-01"
                                        max={getTodayStr()}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">To:</label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={e => setToDate(e.target.value)}
                                        min="2026-01-01"
                                        max={getTodayStr()}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={fetchJobs}
                                    disabled={loadingJobs}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all ${loadingJobs ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {loadingJobs ? 'Loading...' : '🔍 Fetch Jobs'}
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Max 30 days range. Dates between 1 Jan 2026 and today.</p>
                    </div>

                    {!hasFetched ? (
                        <div className="p-12 text-center text-gray-500">Select a date range and click "Fetch Jobs" to view history.</div>
                    ) : loadingJobs && jobs.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">Loading history...</div>
                    ) : jobs.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No jobs found for the selected date range.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {jobs.map(job => (
                                <div key={job.jobId} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${job.status === 'DONE' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    job.status === 'FAILED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        job.status === 'RUNNING' ? 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse' :
                                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {new Date(job.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <h3 className="text-md font-semibold text-gray-900">{job.intent || 'Untitled Job'}</h3>
                                            <p className="text-xs text-mono text-gray-400 mt-1">ID: {job.jobId}</p>
                                            {/* Settings */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {job.modelKey && (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">{job.modelKey}</span>
                                                )}
                                                {job.size && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{job.size}</span>
                                                )}
                                                {job.imageCount && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{job.imageCount} image{job.imageCount > 1 ? 's' : ''}</span>
                                                )}
                                            </div>
                                            {/* Prompt */}
                                            {job.finalPrompt && (
                                                <p className="text-sm text-gray-600 mt-2 max-h-20 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-100">{job.finalPrompt}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteJob(job.jobId)}
                                            className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded border border-red-200"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {/* Images Grid */}
                                    {job.status === 'DONE' && job.cdnUrls && job.cdnUrls.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                                            {job.cdnUrls.map((url, idx) => (
                                                <div key={idx} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={url} alt={`Generated ${idx}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white rounded text-xs font-bold hover:bg-gray-100">View</a>
                                                        <button
                                                            disabled={isDownloading}
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (isDownloading) return;
                                                                setIsDownloading(true);
                                                                try {
                                                                    const response = await fetch(url);
                                                                    const blob = await response.blob();
                                                                    const blobUrl = window.URL.createObjectURL(blob);
                                                                    const link = document.createElement('a');
                                                                    link.href = blobUrl;
                                                                    link.download = `image_${job.jobId}_${idx}.png`;
                                                                    link.click();
                                                                    window.URL.revokeObjectURL(blobUrl);
                                                                    showNotify('Download started!', 'success');
                                                                } catch (err) {
                                                                    showNotify('Download failed', 'error');
                                                                }
                                                                setTimeout(() => setIsDownloading(false), 2000);
                                                            }}
                                                            className={`px-3 py-1 rounded text-xs font-bold ${isDownloading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white`}
                                                        >
                                                            {isDownloading ? '...' : 'Download'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(url);
                                                                showNotify('URL Copied!', 'success');
                                                            }}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Error Display */}
                                    {job.status === 'FAILED' && (
                                        <div className="mt-2 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                                            Error: {job.error || 'Unknown error occurred'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageManager;
