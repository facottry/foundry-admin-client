import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ServerHealth = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/server-health');
            // api.js returns response.data (the body).
            // If backend returns { success: true, data: [...] }, then res is that object. res.data is expected.
            // If backend returns [...], then res is that array. res.data is undefined.
            // Safe check:
            const data = Array.isArray(res) ? res : (res.data || []);
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateRatio = (success, hits) => {
        if (!hits) return 0;
        return ((success / hits) * 100).toFixed(1);
    };

    const getRatioColor = (ratio) => {
        if (ratio >= 98) return 'text-green-600';
        if (ratio >= 90) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) return <div className="p-8">Loading stats...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Server Health Monitor</h1>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hits</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fail</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alive Ratio</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(!stats || stats.length === 0) ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No stats recorded yet.</td>
                            </tr>
                        ) : (
                            stats.map((stat) => {
                                const ratio = calculateRatio(stat.success, stat.hits);
                                return (
                                    <tr key={stat._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{stat.server}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.hits}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{stat.success}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{stat.fail}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getRatioColor(ratio)}`}>
                                            {ratio}%
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServerHealth;
