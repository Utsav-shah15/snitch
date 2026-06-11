import React from 'react';

/**
 * StatCard — Renders a single stat metric card (icon, label, value).
 *
 * @param {{ label: string, value: string|number, icon: string, loading?: boolean }} props
 */
const StatCard = ({ label, value, icon, loading = false }) => {
    return (
        <div className="bg-[#141414] border border-neutral-800 p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold tracking-[0.15em] text-neutral-500 uppercase">{label}</p>
                <span className="text-lg">{icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">
                {loading ? '—' : value}
            </p>
        </div>
    );
};

export default StatCard;
