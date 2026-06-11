import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../cartSlice';

/**
 * CartItem — Renders a single item row in the shopping cart.
 *
 * @param {{ item: object }} props
 */
const CartItem = ({ item }) => {
    const dispatch = useDispatch();

    return (
        <div className="bg-[#141414] border border-neutral-800 p-4 flex gap-4">
            <Link to={`/product/${item._id}`} className="w-20 h-20 shrink-0 bg-neutral-900 overflow-hidden">
                {item.images?.[0]?.url ? (
                    <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">No img</div>
                )}
            </Link>
            <div className="flex-1 min-w-0">
                <Link to={`/product/${item._id}`} className="text-sm font-semibold text-white hover:text-neutral-300 truncate block">
                    {item.title}
                </Link>
                <p className="text-[10px] text-neutral-500 mt-0.5">{item.category} · {item.size}</p>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 border border-neutral-700 text-neutral-400 flex items-center justify-center hover:border-neutral-500 transition-colors cursor-pointer disabled:opacity-30">
                            −
                        </button>
                        <span className="text-xs font-bold text-white w-6 text-center">{item.quantity}</span>
                        <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                            className="w-7 h-7 border border-neutral-700 text-neutral-400 flex items-center justify-center hover:border-neutral-500 transition-colors cursor-pointer">
                            +
                        </button>
                    </div>
                    <p className="text-sm font-bold text-white">
                        ₹{((item.price?.amount || 0) * item.quantity).toLocaleString()}
                    </p>
                </div>
            </div>
            <button onClick={() => dispatch(removeFromCart(item._id))}
                className="text-neutral-600 hover:text-red-400 transition-colors self-start cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default CartItem;
