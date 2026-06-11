import React from 'react';

/**
 * RevenueChart — Simple bar chart for monthly revenue.
 *
 * @param {{ chart: Array<{ month: string, revenue: number }> }} props
 */
const RevenueChart = ({ chart = [] }) => {
    const maxRevenue = chart.length ? Math.max(...chart.map(c => c.revenue), 1) : 1;

    return (
        <div className="bg-[#141414] border border-neutral-900 p-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-6 text-neutral-400">Revenue — Last 6 Months</h2>
            {chart.length === 0 ? (
                <p className="text-neutral-600 text-sm text-center py-8">No revenue data yet.</p>
            ) : (
                <div className="flex items-end gap-3 h-40">
                    {chart.map((c, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-[9px] text-neutral-500">
                                ₹{c.revenue >= 1000 ? `${(c.revenue / 1000).toFixed(1)}k` : c.revenue}
                            </span>
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
    );
};

export default RevenueChart;
