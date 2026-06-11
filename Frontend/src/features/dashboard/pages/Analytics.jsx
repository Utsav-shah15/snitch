import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import DashboardSidebar from '../components/DashboardSidebar';

const BAR_COLORS = ['bg-white', 'bg-neutral-300', 'bg-neutral-500', 'bg-neutral-600', 'bg-neutral-700'];
const CAT_COLORS = ['bg-white', 'bg-neutral-400', 'bg-neutral-600', 'bg-neutral-700'];

const Analytics = () => {
    const { user } = useSelector((state) => state.auth);
    const { overview, chart, topProducts, categories, loading, fetchAll } = useAnalytics();

    if (!user) return <Navigate to="/login" replace />;
    if (!user.isSeller) return <Navigate to="/become-seller" replace />;

    useEffect(() => { fetchAll(); }, []);

    const maxRevenue = chart.length ? Math.max(...chart.map(c => c.revenue), 1) : 1;
    const maxCatRevenue = categories.length ? Math.max(...categories.map(c => c.totalRevenue), 1) : 1;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            <DashboardSidebar />

            {/* Main */}
            <main className="flex-1 p-6 lg:p-10">
                <div className="max-w-5xl">
                    <h1 className="font-serif text-2xl tracking-widest uppercase mb-8">Analytics</h1>

                    {loading ? (
                        <div className="flex justify-center h-64 items-center">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Overview Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                {[
                                    { label: 'Total Revenue', value: `₹${(overview?.totalRevenue || 0).toLocaleString()}` },
                                    { label: 'Total Orders', value: overview?.totalOrders || 0 },
                                    { label: 'Delivered', value: overview?.deliveredOrders || 0 },
                                    { label: 'Conversion', value: `${overview?.conversionRate || 0}%` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-[#141414] border border-neutral-900 p-5">
                                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest mb-2">{label}</p>
                                        <p className="text-2xl font-bold">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Revenue Chart */}
                            <div className="bg-[#141414] border border-neutral-900 p-6 mb-8">
                                <h2 className="text-xs font-semibold tracking-widest uppercase mb-6 text-neutral-400">Revenue — Last 6 Months</h2>
                                {chart.length === 0 ? (
                                    <p className="text-neutral-600 text-sm text-center py-8">No revenue data yet.</p>
                                ) : (
                                    <div className="flex items-end gap-3 h-40">
                                        {chart.map((c, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <span className="text-[9px] text-neutral-500">₹{c.revenue >= 1000 ? `${(c.revenue / 1000).toFixed(1)}k` : c.revenue}</span>
                                                <div
                                                    className="w-full bg-white/80 transition-all duration-500"
                                                    style={{ height: `${Math.max((c.revenue / maxRevenue) * 120, 4)}px` }}
                                                />
                                                <span className="text-[9px] text-neutral-500">{c.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Top Products */}
                                <div className="bg-[#141414] border border-neutral-900 p-6">
                                    <h2 className="text-xs font-semibold tracking-widest uppercase mb-6 text-neutral-400">Top Selling Products</h2>
                                    {topProducts.length === 0 ? (
                                        <p className="text-neutral-600 text-sm text-center py-8">No data yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {topProducts.map((p, i) => (
                                                <div key={p.productId} className="flex items-center gap-3">
                                                    <span className="text-[10px] text-neutral-600 w-4">{i + 1}</span>
                                                    <div className="w-10 h-10 bg-neutral-900 flex-shrink-0 overflow-hidden">
                                                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs truncate">{p.title}</p>
                                                        <p className="text-[10px] text-neutral-500">{p.totalSold} sold</p>
                                                    </div>
                                                    <p className="text-sm font-bold flex-shrink-0">₹{p.totalRevenue?.toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Category Performance */}
                                <div className="bg-[#141414] border border-neutral-900 p-6">
                                    <h2 className="text-xs font-semibold tracking-widest uppercase mb-6 text-neutral-400">Category Performance</h2>
                                    {categories.length === 0 ? (
                                        <p className="text-neutral-600 text-sm text-center py-8">No data yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {categories.map((cat, i) => (
                                                <div key={cat._id}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-neutral-300">{cat._id}</span>
                                                        <span className="text-xs font-bold">₹{cat.totalRevenue?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full bg-neutral-800 h-1.5">
                                                        <div
                                                            className={`h-full ${CAT_COLORS[i % CAT_COLORS.length]} transition-all duration-700`}
                                                            style={{ width: `${(cat.totalRevenue / maxCatRevenue) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-neutral-600 mt-0.5">{cat.totalOrders} orders</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Analytics;
