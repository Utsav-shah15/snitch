import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useOrders from '../hooks/useOrders';

const statusColors = {
    pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    confirmed: 'bg-blue-900/30 text-blue-400 border-blue-800',
    shipped: 'bg-purple-900/30 text-purple-400 border-purple-800',
    delivered: 'bg-green-900/30 text-green-400 border-green-800',
    cancelled: 'bg-red-900/30 text-red-400 border-red-800',
};

const Orders = () => {
    const { user } = useSelector((state) => state.auth);
    const { orders, loading, fetchMyOrders, reSnitch } = useOrders();
    const navigate = useNavigate();

    // Re-Snitch states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [resalePrice, setResalePrice] = useState('');
    const [resaleDesc, setResaleDesc] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [modalError, setModalError] = useState(null);

    if (!user) return <Navigate to="/login" replace />;

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const handleReSnitchSubmit = async (e) => {
        e.preventDefault();
        if (!resalePrice || parseFloat(resalePrice) <= 0) {
            setModalError("Please enter a valid price");
            return;
        }

        setActionLoading(true);
        setModalError(null);

        try {
            const result = await reSnitch(selectedOrder._id, {
                price: parseFloat(resalePrice),
                description: resaleDesc
            });

            // Close modal & reset inputs
            setSelectedOrder(null);
            setResalePrice('');
            setResaleDesc('');

            // Redirect to the newly created product page!
            if (result && result.product) {
                navigate(`/product/${result.product._id}`);
            } else {
                fetchMyOrders();
            }
        } catch (err) {
            setModalError(err.message || "Failed to re-snitch item");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase mb-8">My Orders</h1>

            {loading && orders.length === 0 ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-[#141414] border border-neutral-800 p-5 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-neutral-800 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-neutral-800 rounded w-1/3" />
                                    <div className="h-3 bg-neutral-800 rounded w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <svg className="w-16 h-16 text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
                    <p className="text-neutral-500 text-sm mb-6">Start shopping to see your orders here</p>
                    <Link to="/browse" className="bg-white text-black text-xs font-bold tracking-[0.2em] px-8 py-3 uppercase inline-block">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-[#141414] border border-neutral-800 p-5 hover:border-neutral-700 transition-colors">
                            <div className="flex gap-4">
                                {/* Image */}
                                <Link to={`/product/${order.product?._id}`} className="w-16 h-16 bg-neutral-900 shrink-0 overflow-hidden">
                                    {order.product?.images?.[0]?.url ? (
                                        <img src={order.product.images[0].url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-700 text-[10px]">No img</div>
                                    )}
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-sm font-semibold text-white truncate">{order.product?.title || 'Product'}</h3>
                                            <p className="text-[10px] text-neutral-500 mt-0.5">
                                                Qty: {order.quantity} · Sold by: {order.seller?.sellerProfile?.shopName || order.seller?.fullName || 'Seller'}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-white shrink-0">₹{order.totalPrice?.toLocaleString()}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 border-t border-neutral-900 pt-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                            {order.status === 'delivered' && (
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-[10px] font-bold uppercase tracking-widest bg-white text-black px-3 py-1.5 hover:bg-neutral-200 transition-colors rounded flex items-center gap-1"
                                                >
                                                    ⚡ Re-Snitch
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-neutral-600">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Re-Snitch Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#101010] border border-neutral-800 rounded-xl max-w-md w-full p-6 space-y-6 relative">
                        <button
                            onClick={() => {
                                setSelectedOrder(null);
                                setResalePrice('');
                                setResaleDesc('');
                                setModalError(null);
                            }}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white text-sm"
                        >
                            ✕
                        </button>

                        <div className="space-y-2">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                ⚡ Re-Snitch Product
                            </h2>
                            <p className="text-xs text-neutral-400">
                                List this item back on the market. The original seller gets a <strong>5% royalty</strong> on every resale.
                            </p>
                        </div>

                        {/* Product info preview */}
                        <div className="flex gap-4 bg-[#181818] border border-neutral-900 p-3 rounded-lg">
                            <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0 rounded">
                                {selectedOrder.product?.images?.[0]?.url && (
                                    <img src={selectedOrder.product.images[0].url} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-neutral-200 truncate">{selectedOrder.product?.title}</p>
                                <p className="text-[10px] text-neutral-500 mt-0.5">Original Purchase Price: ₹{(selectedOrder.product?.price?.amount || selectedOrder.totalPrice).toLocaleString()}</p>
                            </div>
                        </div>

                        <form onSubmit={handleReSnitchSubmit} className="space-y-4">
                            {modalError && (
                                <div className="p-3 bg-red-900/20 border border-red-800 text-red-400 text-xs rounded-md">
                                    {modalError}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                    Resale Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="Enter your resell price"
                                    value={resalePrice}
                                    onChange={(e) => setResalePrice(e.target.value)}
                                    className="w-full bg-[#161616] border border-neutral-800 px-4 py-2.5 text-sm rounded-md text-white focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                    Resale Description (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Describe the condition or add a note..."
                                    value={resaleDesc}
                                    onChange={(e) => setResaleDesc(e.target.value)}
                                    className="w-full bg-[#161616] border border-neutral-800 px-4 py-2.5 text-sm rounded-md text-white focus:outline-none focus:border-white transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-3 rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? (
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    '⚡ List Item'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
