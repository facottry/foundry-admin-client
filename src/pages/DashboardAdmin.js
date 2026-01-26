import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import KpiCard from '../components/KpiCard';
import StatTable from '../components/StatTable';

const DashboardAdmin = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, tech, products
    const [overview, setOverview] = useState(null);
    const [traffic, setTraffic] = useState(null);
    const [economics, setEconomics] = useState(null);
    const [campaigns, setCampaigns] = useState(null);
    const [moderation, setModeration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchAllKPIs = async () => {
        try {
            setLoading(true);
            setError(null);

            const [overviewRes, trafficRes, economicsRes, campaignsRes, moderationRes] = await Promise.all([
                api.get('/admin/kpis/overview'),
                api.get('/admin/kpis/traffic'),
                api.get('/admin/kpis/economics'),
                api.get('/admin/kpis/campaigns'),
                api.get('/admin/kpis/moderation')
            ]);

            setOverview(overviewRes.data);
            setTraffic(trafficRes.data);
            setEconomics(economicsRes.data);
            setCampaigns(campaignsRes.data);
            setModeration(moderationRes.data);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Error fetching KPIs:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllKPIs();
        const interval = setInterval(fetchAllKPIs, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        fetchAllKPIs();
    };

    if (loading && !overview) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading dashboard...</div>
            </div>
        );
    }

    if (error && !overview) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#ef4444', marginBottom: '20px' }}>
                    Error: {error}
                </div>
                <button onClick={handleRefresh} className="btn btn-primary">Retry</button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'tech', label: 'Tech Metrics', icon: '⚙️' },
        { id: 'products', label: 'Product Metrics', icon: '📦' }
    ];

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
            {/* Header with Tabs */}
            <div style={{ background: 'white', borderBottom: '1px solid #E5E5E5' }}>
                <div style={{ padding: '20px 40px', borderBottom: '1px solid #E5E5E5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1a1a1a' }}>
                                Admin Dashboard
                            </h1>
                            <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '4px' }}>
                                Last updated: {lastRefresh.toLocaleTimeString()}
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: loading ? '#ccc' : '#1a1a1a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >
                            {loading ? 'Refreshing...' : '↻ Refresh'}
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ padding: '0 40px', display: 'flex', gap: '8px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '14px 24px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid #1a1a1a' : '3px solid transparent',
                                color: activeTab === tab.id ? '#1a1a1a' : '#666',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '30px 40px' }}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <KpiCard label="Total Users" value={overview?.users?.totalUsers} subtitle={`${overview?.users?.totalFounders || 0} founders, ${overview?.users?.totalCustomers || 0} customers`} />
                            <KpiCard label="Total Products" value={overview?.products?.totalProducts} subtitle={`${overview?.products?.approvedProducts || 0} approved`} />
                            <KpiCard label="Total Clicks" value={traffic?.totalClicks} subtitle={`${traffic?.clicksToday || 0} today`} />
                            <KpiCard label="Revenue (Credits)" value={economics?.revenueEstimate} subtitle={`${economics?.totalCreditsConsumed || 0} consumed`} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                            <StatTable
                                title="Top Products by Clicks"
                                columns={[
                                    { label: 'Product', key: 'productName' },
                                    { label: 'Clicks', key: 'clicks', align: 'right' }
                                ]}
                                data={traffic?.topProducts?.slice(0, 5) || []}
                            />
                            <StatTable
                                title="Pending Moderation"
                                columns={[
                                    { label: 'Product', key: 'name' },
                                    { label: 'Owner', key: 'owner_user_id', render: (owner) => owner?.name || 'Unknown' }
                                ]}
                                data={moderation?.pendingProducts?.slice(0, 5) || []}
                            />
                        </div>
                    </>
                )}

                {/* Tech Metrics Tab */}
                {activeTab === 'tech' && (
                    <>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px', color: '#1a1a1a' }}>
                            Platform Health & Performance
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <KpiCard label="Total Clicks" value={traffic?.totalClicks} subtitle="All-time outbound clicks" />
                            <KpiCard label="Clicks Today" value={traffic?.clicksToday} subtitle="Last 24 hours" />
                            <KpiCard label="Clicks (7 Days)" value={traffic?.clicksLast7Days} subtitle="Last week" />
                            <KpiCard label="Transactions" value={economics?.transactionCount} subtitle="Wallet operations" />
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <StatTable
                                title="Traffic Analytics - Top 10 Products"
                                columns={[
                                    { label: 'Rank', key: 'rank', render: (_, row, idx) => `#${idx + 1}` },
                                    { label: 'Product', key: 'productName' },
                                    { label: 'Total Clicks', key: 'clicks', align: 'right' }
                                ]}
                                data={traffic?.topProducts || []}
                            />
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                            Campaign Performance
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <KpiCard label="Active Campaigns" value={campaigns?.activeCampaigns} />
                            <KpiCard label="Paused Campaigns" value={campaigns?.pausedCampaigns} />
                            <KpiCard label="Total Spend" value={campaigns?.totalSpend} subtitle="Credits consumed" />
                            <KpiCard label="Spend Today" value={campaigns?.spendToday} subtitle="Last 24 hours" />
                        </div>

                        <StatTable
                            title="Top Campaigns by Spend"
                            columns={[
                                { label: 'Product', key: 'productName' },
                                { label: 'Category', key: 'category' },
                                { label: 'Status', key: 'status' },
                                { label: 'Credits Spent', key: 'creditsSpent', align: 'right' }
                            ]}
                            data={campaigns?.topCampaigns || []}
                        />
                    </>
                )}

                {/* Product Metrics Tab */}
                {activeTab === 'products' && (
                    <>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px', color: '#1a1a1a' }}>
                            Product & User Analytics
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <KpiCard label="Total Products" value={overview?.products?.totalProducts} />
                            <KpiCard label="Approved" value={overview?.products?.approvedProducts} />
                            <KpiCard label="Pending" value={overview?.products?.pendingProducts} />
                            <KpiCard label="Rejected" value={overview?.products?.rejectedProducts} />
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                            User Breakdown
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <KpiCard label="Total Users" value={overview?.users?.totalUsers} />
                            <KpiCard label="Founders" value={overview?.users?.totalFounders} subtitle="Product creators" />
                            <KpiCard label="Customers" value={overview?.users?.totalCustomers} subtitle="Browsers" />
                            <KpiCard label="Admins" value={overview?.users?.totalAdmins} subtitle="Platform admins" />
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                            Economics
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <KpiCard label="Credits Issued" value={economics?.totalCreditsIssued} subtitle="Total granted" />
                            <KpiCard label="Credits Consumed" value={economics?.totalCreditsConsumed} subtitle="Total spent" />
                            <KpiCard label="Paid Topups" value={economics?.paidTopups} subtitle="Revenue credits" />
                            <KpiCard label="Wallets Near Zero" value={economics?.walletsNearZero} subtitle="< 100 credits" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <StatTable
                                title="Founders with Lowest Credits"
                                columns={[
                                    { label: 'Name', key: 'name' },
                                    { label: 'Email', key: 'email' },
                                    { label: 'Balance', key: 'creditsBalance', align: 'right' }
                                ]}
                                data={economics?.topSpenders || []}
                            />
                            <StatTable
                                title="Moderation Queue"
                                columns={[
                                    { label: 'Product', key: 'name' },
                                    { label: 'Status', key: 'status' }
                                ]}
                                data={moderation?.pendingProducts?.slice(0, 10) || []}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardAdmin;
