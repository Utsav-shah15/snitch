import React from 'react';

/**
 * OrderSummary — Reusable order summary sidebar used in Cart and Checkout pages.
 *
 * @param {{ items: Array, total: number, children: React.ReactNode }} props
 * children — action buttons rendered at the bottom (e.g., "Proceed to Checkout" or "Place Order")
 */
const OrderSummary = ({ items, total, children }) => {
    return (
        <div className="bg-[#141414] border border-neutral-800 p-6 h-fit sticky top-20">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-800 shrink-0 overflow-hidden">
                            {item.images?.[0]?.url && (
                                <img src={item.images[0].url} alt="" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-neutral-500">x{item.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-white">₹{((item.price?.amount || 0) * item.quantity).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="border-t border-neutral-700 pt-3 mb-6">
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Shipping</span><span className="text-green-500">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white">
                    <span>Total</span><span>₹{total.toLocaleString()}</span>
                </div>
            </div>

            {children}
        </div>
    );
};

export default OrderSummary;
