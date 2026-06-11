import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    { label: 'Overview', to: '/dashboard' },
    { label: 'Listings', to: '/dashboard/listings' },
    { label: 'Orders', to: '/dashboard/orders' },
    { label: 'Offers', to: '/dashboard/offers' },
    { label: 'Wallet', to: '/dashboard/wallet' },
    { label: 'Analytics', to: '/dashboard/analytics' },
];

/**
 * DashboardSidebar — Shared sidebar navigation for all seller dashboard pages.
 * Automatically highlights the current route.
 */
const DashboardSidebar = () => {
    const { pathname } = useLocation();

    return (
        <aside className="w-56 min-h-screen bg-[#111] border-r border-neutral-900 px-4 py-8 hidden md:flex flex-col gap-1 sticky top-0">
            <p className="text-[9px] text-neutral-600 tracking-widest uppercase mb-4">Seller Hub</p>
            {NAV_ITEMS.map(({ label, to }) => {
                const isActive = pathname === to;
                return (
                    <Link
                        key={to}
                        to={to}
                        className={`text-xs py-2.5 px-3 tracking-wider uppercase transition-colors ${
                            isActive
                                ? 'text-white bg-neutral-800'
                                : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}
        </aside>
    );
};

export default DashboardSidebar;
