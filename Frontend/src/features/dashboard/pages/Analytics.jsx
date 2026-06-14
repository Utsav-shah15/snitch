import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import DashboardSidebar from '../components/DashboardSidebar';
import TrendForecaster from '../components/TrendForecaster';

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

    // Dynamic Path Generator for the SVG Bezier Line & Area Chart
    const getSvgPaths = (data) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const activeData = [];
        const currentMonthIndex = new Date().getMonth(); // 0-11
        
        // Generate last 6 months dynamically and populate with real DB revenue
        for (let i = 5; i >= 0; i--) {
            const targetMonthIndex = (currentMonthIndex - i + 12) % 12;
            const m = months[targetMonthIndex];
            const matched = data ? data.find(item => item.month === m) : null;
            activeData.push({
                month: m,
                revenue: matched ? matched.revenue : 0
            });
        }

        const width = 800;
        const height = 160;
        const paddingX = 40;
        const paddingY = 20;
        const chartWidth = width - paddingX * 2;
        const chartHeight = height - paddingY * 2;

        const maxVal = Math.max(...activeData.map(d => d.revenue), 1000);
        
        const points = activeData.map((d, i) => {
            const x = paddingX + (i / (activeData.length - 1)) * chartWidth;
            const y = height - paddingY - (d.revenue / maxVal) * chartHeight;
            return { x, y };
        });

        // Generate smooth Bezier curve
        let linePath = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp1y = p0.y;
            const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
            const cp2y = p1.y;
            linePath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
        }

        const areaPath = `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;
        
        return { linePath, areaPath, maxVal, activeData };
    };

    const { linePath, areaPath, maxVal, activeData } = getSvgPaths(chart);

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
                            <div className="bg-[#141414] border border-neutral-950 p-6 mb-8">
                                <h2 className="text-xs font-semibold tracking-widest uppercase mb-6 text-neutral-400">Revenue — Last 6 Months</h2>
                                <div className="relative h-44 w-full flex">
                                    {/* Y-Axis Labels */}
                                    <div className="flex flex-col justify-between text-[10px] text-neutral-500 pr-4 pb-6 h-full text-right select-none w-16">
                                        <span>₹{maxVal.toLocaleString()}</span>
                                        <span>₹{Math.round(maxVal * 0.5).toLocaleString()}</span>
                                        <span>₹0</span>
                                    </div>

                                    {/* Chart Canvas Area */}
                                    <div className="flex-1 h-full relative flex flex-col justify-between">
                                        {/* Background Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
                                            <div className="border-b border-neutral-900 w-full h-0" />
                                            <div className="border-b border-neutral-900 w-full h-0" />
                                            <div className="border-b border-neutral-900 w-full h-0" />
                                        </div>

                                        {/* SVG Bezier Area & Line */}
                                        <div className="absolute inset-x-0 top-0 bottom-6 pointer-events-none">
                                            <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                                                    </linearGradient>
                                                </defs>

                                                {/* Area Path */}
                                                {areaPath && (
                                                    <path
                                                        d={areaPath}
                                                        fill="url(#glowGrad)"
                                                    />
                                                )}

                                                {/* Line Path */}
                                                {linePath && (
                                                    <path
                                                        d={linePath}
                                                        fill="transparent"
                                                        stroke="#22c55e"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />
                                                )}
                                            </svg>
                                        </div>

                                        {/* X-Axis Labels */}
                                        <div className="absolute bottom-0 inset-x-0 h-6 flex justify-between text-[10px] text-neutral-500 font-medium px-4 select-none">
                                            {activeData.map((d, index) => (
                                                <span key={index}>{d.month}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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

                    {/* AI Trend Forecaster */}
                    <div className="mt-8">
                        <TrendForecaster />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
