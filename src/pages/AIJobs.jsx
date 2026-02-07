import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AIJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/admin/ai-jobs');
            setJobs(res.data || res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showNotify = (msg, type = 'info') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleToggle = async (jobId) => {
        try {
            await api.post(`/admin/ai-jobs/${jobId}/toggle`);
            fetchJobs();
            showNotify('Job status updated', 'success');
        } catch (err) {
            showNotify('Failed to toggle job', 'error');
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm('Delete this job? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/ai-jobs/${jobId}`);
            setJobs(prev => prev.filter(j => j._id !== jobId));
            showNotify('Job deleted', 'success');
        } catch (err) {
            showNotify('Failed to delete job', 'error');
        }
    };

    const formatSchedule = (schedule) => {
        if (!schedule) return '-';
        const time = schedule.time || '00:00';
        if (schedule.frequency === 'DAILY') {
            return `Daily at ${time}`;
        } else if (schedule.frequency === 'WEEKLY') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return `Every ${days[schedule.dayOfWeek] || 'Sun'} at ${time}`;
        } else if (schedule.frequency === 'CUSTOM') {
            return `CRON: ${schedule.customCron || '-'}`;
        }
        return schedule.frequency;
    };

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-700 border-green-200',
            PAUSED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            FAILED: 'bg-red-100 text-red-700 border-red-200'
        };
        return `px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status] || styles.PAUSED}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white font-medium`}>
                    {notification.msg}
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Jobs</h1>
                        <p className="text-gray-500 mt-1">Manage automated newsletter generation jobs</p>
                    </div>
                    <button
                        onClick={() => navigate('/ai-jobs/new')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        + New Job
                    </button>
                </div>

                {/* Jobs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading jobs...</div>
                    ) : jobs.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <p className="mb-4">No AI jobs configured yet.</p>
                            <button
                                onClick={() => navigate('/ai-jobs/new')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Create Your First Job
                            </button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Name</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Run</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {jobs.map(job => (
                                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link to={`/ai-jobs/${job._id}`} className="text-gray-900 font-medium hover:text-blue-600">
                                                {job.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{job.type}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatSchedule(job.schedule)}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {job.stats?.lastRunAt ? new Date(job.stats.lastRunAt).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={getStatusBadge(job.status)}>{job.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.post(`/admin/ai-jobs/${job._id}/run`);
                                                            showNotify('Job triggered successfully', 'success');
                                                            fetchJobs();
                                                        } catch (err) {
                                                            showNotify('Failed to trigger job', 'error');
                                                        }
                                                    }}
                                                    className="px-3 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded border border-purple-200"
                                                >
                                                    Run
                                                </button>
                                                <Link
                                                    to={`/ai-jobs/${job._id}`}
                                                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/ai-jobs/${job._id}/edit`}
                                                    className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleToggle(job._id)}
                                                    className={`px-3 py-1 text-xs font-medium rounded border ${job.status === 'ACTIVE'
                                                        ? 'text-yellow-600 hover:bg-yellow-50 border-yellow-200'
                                                        : 'text-green-600 hover:bg-green-50 border-green-200'
                                                        }`}
                                                >
                                                    {job.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job._id)}
                                                    className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded border border-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Stats Summary */}
                {jobs.length > 0 && (
                    <div className="mt-6 grid grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
                            <div className="text-sm text-gray-500">Total Jobs</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === 'ACTIVE').length}</div>
                            <div className="text-sm text-gray-500">Active</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-2xl font-bold text-yellow-600">{jobs.filter(j => j.status === 'PAUSED').length}</div>
                            <div className="text-sm text-gray-500">Paused</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-2xl font-bold text-red-600">{jobs.filter(j => j.status === 'FAILED').length}</div>
                            <div className="text-sm text-gray-500">Failed</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIJobs;
