import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const AIJobDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [job, setJob] = useState(null);
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [jobRes, runsRes] = await Promise.all([
                api.get(`/admin/ai-jobs/${id}`),
                api.get(`/admin/ai-jobs/${id}/runs`)
            ]);
            setJob(jobRes.data || jobRes);
            setRuns(runsRes.data || runsRes || []);
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

    const handleToggle = async () => {
        try {
            await api.post(`/admin/ai-jobs/${id}/toggle`);
            fetchData();
            showNotify('Job status updated', 'success');
        } catch (err) {
            showNotify('Failed to toggle job', 'error');
        }
    };

    const formatSchedule = (schedule) => {
        if (!schedule) return '-';
        const time = schedule.time || '00:00';
        if (schedule.frequency === 'DAILY') {
            return `Daily at ${time}`;
        } else if (schedule.frequency === 'WEEKLY') {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return `Every ${days[schedule.dayOfWeek] || 'Sunday'} at ${time}`;
        }
        return schedule.frequency;
    };

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-700 border-green-200',
            PAUSED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            FAILED: 'bg-red-100 text-red-700 border-red-200',
            SUCCESS: 'bg-green-100 text-green-700 border-green-200',
            PARTIAL: 'bg-orange-100 text-orange-700 border-orange-200',
            RUNNING: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse'
        };
        return `px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${styles[status] || 'bg-gray-100 text-gray-600'}`;
    };

    const getSuccessRate = () => {
        if (!job?.stats?.totalRuns) return 0;
        return Math.round((job.stats.successCount / job.stats.totalRuns) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-gray-500">Job not found</div>
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

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button onClick={() => navigate('/ai-jobs')} className="text-blue-600 hover:text-blue-700 text-sm mb-2">
                        ← Back to Jobs
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{job.name}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={getStatusBadge(job.status)}>{job.status}</span>
                                <span className="text-gray-500 text-sm">{job.type}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        await api.post(`/admin/ai-jobs/${id}/run`);
                                        showNotify('Job triggered successfully', 'success');
                                        fetchData();
                                    } catch (err) {
                                        showNotify('Failed to trigger job', 'error');
                                    }
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                            >
                                Run Now
                            </button>
                            <Link
                                to={`/ai-jobs/${id}/edit`}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={handleToggle}
                                className={`px-4 py-2 rounded-lg font-semibold ${job.status === 'ACTIVE'
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {job.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-sm text-gray-500">Schedule</div>
                        <div className="font-medium text-gray-900">{formatSchedule(job.schedule)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Next Run</div>
                        <div className="font-medium text-gray-900">
                            {job.stats?.nextRunAt && job.status === 'ACTIVE'
                                ? new Date(job.stats.nextRunAt).toLocaleString()
                                : '-'
                            }
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Last Successful Run</div>
                        <div className="font-medium text-gray-900">
                            {job.stats?.lastRunAt
                                ? new Date(job.stats.lastRunAt).toLocaleString()
                                : 'Never'
                            }
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">AI Model</div>
                        <div className="font-medium text-gray-900">{job.config?.aiModel || '-'}</div>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{job.stats?.totalRuns || 0}</div>
                    <div className="text-sm text-gray-500">Total Runs</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{getSuccessRate()}%</div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">{job.config?.autoSend ? 'Yes' : 'No'}</div>
                    <div className="text-sm text-gray-500">Auto-Send</div>
                </div>
            </div>

            {/* Execution History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Execution History</h2>
                </div>
                {runs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No runs yet.</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Run Time</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Generated</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Sent</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Recipients</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {runs.map(run => (
                                <tr key={run._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {new Date(run.startedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {run.generated ? (
                                            run.newsletterId ? (
                                                <Link
                                                    to={`/newsletters/${run.newsletterId._id || run.newsletterId}`}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    Yes → View
                                                </Link>
                                            ) : (
                                                <span className="text-green-600 text-sm">Yes</span>
                                            )
                                        ) : (
                                            <span className="text-gray-400 text-sm">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {run.sent ? (
                                            <span className="text-green-600">Yes</span>
                                        ) : (
                                            <span className="text-gray-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{run.recipientCount || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={getStatusBadge(run.status)}>{run.status}</span>
                                        {run.error && (
                                            <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={run.error}>
                                                {run.error}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AIJobDetail;
