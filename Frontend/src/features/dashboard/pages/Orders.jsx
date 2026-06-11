import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useOrders from '../../orders/hooks/useOrders';
import DashboardSidebar from '../components/DashboardSidebar';

const STATUS_COLORS = {
    pending: 'text-yellow-400 bg-yellow-950/40 border-yellow-900/50',
    confirmed: 'text-blue-400 bg-blue-950/40 border-blue-900/50',
    shipped: 'text-purple-400 bg-purple-950/40 border-purple-900/50',
    delivered: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50',
    cancelled: 'text-red-400 bg-red-950/40 border-red-900/50',
};

const NEXT_STATUS = {
    pending: 'confirmed',
    confirmed: 'shipped',
    shipped: 'delivered',
};

const DashboardOrders = () => {
    const { user } = useSelector((state) => state.auth);
    const { sellerOrders, loading, fetchSellerOrders, updateOrderStatus } = useOrders();
    const [filter, setFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    if (!user) return <Navigate to="/login" replace />;
    if (!user.isSeller) return <Navigate to="/become-seller" replace />;

    useEffect(() => {
        fetchSellerOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (e) {
            alert(e.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = filter === 'all' ? sellerOrders : sellerOrders.filter(o => o.status === filter);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            <DashboardSidebar />

            {/* Main */}
            <main className="flex-1 p-6 lg:p-10">
                <div className="max-w-5xl">
                    <div className="mb-8">
                        <h1 className="font-serif text-2xl tracking-widest uppercase">Received Orders</h1>
                        <p className="text-neutral-500 text-xs mt-1">{sellerOrders.length} total orders</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 border transition-colors cursor-pointer ${filter === f ? 'border-white text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-neutral-800">
                            <p className="text-neutral-600 text-sm">No orders found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map(order => (
                                <div key={order._id} className="bg-[#141414] border border-neutral-900 p-5 hover:border-neutral-700 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {/* Product image */}
                                        <div className="w-14 h-14 bg-neutral-900 flex-shrink-0 overflow-hidden">
                                            {order.product?.images?.[0]?.url ? (
                                                <img src={order.product.images[0].url} alt={order.product.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">No img</div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">{order.product?.title || 'Product'}</p>
                                            <p className="text-neutral-500 text-xs mt-0.5">
                                                Buyer: <span className="text-neutral-300">{order.buyer?.fullName}</span>
                                                {order.buyer?.email && <span className="text-neutral-600"> — {order.buyer.email}</span>}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-white font-bold text-sm">₹{order.totalPrice?.toLocaleString()}</span>
                                                <span className="text-neutral-500 text-xs">Qty: {order.quantity}</span>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 border ${STATUS_COLORS[order.status]}`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </div>
                                            {order.shippingAddress && (
                                                <p className="text-neutral-600 text-[10px] mt-1">
                                                    Ship to: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                                            {NEXT_STATUS[order.status] && (
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])}
                                                    className="text-[10px] font-bold tracking-widest uppercase px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50">
                                                    {updatingId === order._id ? '...' : `Mark ${NEXT_STATUS[order.status]}`}
                                                </button>
                                            )}
                                            {order.status === 'pending' && (
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                    className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-wider px-4 py-1.5 border border-red-900/50 hover:border-red-700 transition-colors cursor-pointer disabled:opacity-50">
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardOrders;
