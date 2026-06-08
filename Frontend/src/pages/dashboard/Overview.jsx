import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getMyListings } from '../../features/products/services/product.service';
import { getSellerOrders } from '../../features/orders/services/order.service';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ listings: 0, orders: 0, revenue: 0, pending: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    if (!user) return <Navigate to="/login" replace />;
    if (!user.isSeller) return <Navigate to="/become-seller" replace />;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listingsData, ordersData] = await Promise.all([
                    getMyListings(),
                    getSellerOrders(),
                ]);

                const listings = listingsData.products || [];
                const orders = ordersData.orders || [];

                const revenue = orders
                    .filter(o => o.status === 'delivered')
                    .reduce((sum, o) => sum + o.totalPrice, 0);

                const pending = orders.filter(o => o.status === 'pending').length;

                setStats({
                    listings: listings.length,
                    orders: orders.length,
                    revenue,
                    pending,
                });
                setRecentOrders(orders.slice(0, 5));
            } catch { /* silent */ } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰' },
        { label: 'Total Orders', value: stats.orders, icon: '📦' },
        { label: 'Active Listings', value: stats.listings, icon: '🏷️' },
        { label: 'Pending Orders', value: stats.pending, icon: '⏳' },
    ];

    const statusColors = {
        pending: 'text-yellow-400',
        confirmed: 'text-blue-400',
        shipped: 'text-purple-400',
        delivered: 'text-green-400',
        cancelled: 'text-red-400',
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl font-bold text-white">
                        Welcome, {user.sellerProfile?.shopName || user.fullName}
                    </h1>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Seller Dashboard</p>
                </div>
                <Link to="/dashboard/listings"
                    className="bg-white text-black text-[11px] font-bold tracking-[0.15em] px-6 py-2.5 hover:bg-neutral-200 transition-colors uppercase">
                    + New Listing
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-[#141414] border border-neutral-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-bold tracking-[0.15em] text-neutral-500 uppercase">{stat.label}</p>
                            <span className="text-lg">{stat.icon}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {loading ? '—' : stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { label: 'My Listings', to: '/dashboard/listings', desc: 'Manage products' },
                    { label: 'Orders', to: '/dashboard/orders', desc: 'Received orders' },
                    { label: 'Wallet', to: '/dashboard/wallet', desc: 'Earnings & payouts' },
                    { label: 'Analytics', to: '/dashboard/analytics', desc: 'Sales data' },
                ].map((link) => (
                    <Link key={link.label} to={link.to}
                        className="bg-[#141414] border border-neutral-800 p-5 hover:border-neutral-600 transition-all group">
                        <p className="text-sm font-semibold text-white group-hover:text-neutral-300">{link.label}</p>
                        <p className="text-[10px] text-neutral-500 mt-1">{link.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Recent Orders</h2>
                    <Link to="/dashboard/orders" className="text-[10px] text-neutral-400 hover:text-white transition-colors">
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-[#141414] border border-neutral-800 p-4 animate-pulse">
                                <div className="h-4 bg-neutral-800 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="bg-[#141414] border border-neutral-800 p-8 text-center">
                        <p className="text-neutral-500 text-sm">No orders yet</p>
                    </div>
                ) : (
                    <div className="bg-[#141414] border border-neutral-800 divide-y divide-neutral-800">
                        {recentOrders.map((order) => (
                            <div key={order._id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-neutral-800 shrink-0 overflow-hidden">
                                        {order.product?.images?.[0]?.url && (
                                            <img src={order.product.images[0].url} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-white font-semibold truncate max-w-[200px]">{order.product?.title}</p>
                                        <p className="text-[10px] text-neutral-500">{order.buyer?.fullName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-white">₹{order.totalPrice?.toLocaleString()}</p>
                                    <p className={`text-[10px] uppercase font-bold ${statusColors[order.status]}`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
