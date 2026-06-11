import React from 'react';
import { Link } from 'react-router-dom';

const statusColors = {
    pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    confirmed: 'bg-blue-900/30 text-blue-400 border-blue-800',
    shipped: 'bg-purple-900/30 text-purple-400 border-purple-800',
    delivered: 'bg-green-900/30 text-green-400 border-green-800',
    cancelled: 'bg-red-900/30 text-red-400 border-red-800',
};

/**
 * OrderCard — Renders a single order row with product image, title, status badge, and price.
 *
 * @param {{ order: object }} props
 */
const OrderCard = ({ order }) => {
    return (
        <div className="bg-[#141414] border border-neutral-800 p-5 hover:border-neutral-700 transition-colors">
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

                    <div className="flex items-center justify-between mt-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border ${statusColors[order.status]}`}>
                            {order.status}
                        </span>
                        <p className="text-[10px] text-neutral-600">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
