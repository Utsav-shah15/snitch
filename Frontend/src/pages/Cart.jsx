import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice';

const Cart = () => {
    const { items } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const total = items.reduce((sum, item) => sum + (item.price?.amount || 0) * item.quantity, 0);

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <p className="text-neutral-400 mb-4">Please login to view your cart</p>
                <Link to="/login" className="bg-white text-black text-xs font-bold tracking-[0.2em] px-8 py-3 uppercase">
                    Login
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <svg className="w-16 h-16 text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
                <p className="text-neutral-500 text-sm mb-6">Browse our collection and add items to your cart</p>
                <Link to="/browse" className="bg-white text-black text-xs font-bold tracking-[0.2em] px-8 py-3 uppercase inline-block">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase mb-8">
                Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item._id} className="bg-[#141414] border border-neutral-800 p-4 flex gap-4">
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
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-[#141414] border border-neutral-800 p-6 h-fit sticky top-20">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-4">Order Summary</h3>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs text-neutral-400">
                            <span>Subtotal</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-400">
                            <span>Shipping</span>
                            <span className="text-green-500">Free</span>
                        </div>
                    </div>
                    <div className="border-t border-neutral-700 pt-3 mb-6">
                        <div className="flex justify-between text-sm font-bold text-white">
                            <span>Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={() => navigate('/checkout')}
                        className="w-full bg-white text-black text-xs font-bold tracking-[0.2em] py-3.5 hover:bg-neutral-200 transition-colors uppercase cursor-pointer">
                        Proceed to Checkout
                    </button>
                    <button onClick={() => dispatch(clearCart())}
                        className="w-full text-neutral-500 text-[10px] tracking-wider uppercase mt-3 hover:text-red-400 transition-colors cursor-pointer">
                        Clear Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
