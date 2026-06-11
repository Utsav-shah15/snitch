import React from 'react';

/**
 * StatusBadge — Displays a color-coded order status badge.
 *
 * @param {{ status: string }} props
 */
const STATUS_COLORS = {
    pending: 'text-yellow-400 bg-yellow-950/40 border-yellow-900/50',
    confirmed: 'text-blue-400 bg-blue-950/40 border-blue-900/50',
    shipped: 'text-purple-400 bg-purple-950/40 border-purple-900/50',
    delivered: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50',
    cancelled: 'text-red-400 bg-red-950/40 border-red-900/50',
};

const StatusBadge = ({ status }) => {
    return (
        <span className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${STATUS_COLORS[status] || ''}`}>
            {status?.toUpperCase()}
        </span>
    );
};

export default StatusBadge;
