import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { clearCart } from '../cartSlice';
import { getProductById } from '../../products/services/product.service';
import { getOfferById } from '../../offers/services/offer.service';
import usePayment from '../../orders/hooks/usePayment';

const Checkout = () => {
    const { items } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Query params for Buy Now / Accept Offer direct purchase
    const [searchParams] = useSearchParams();
    const productIdParam = searchParams.get('productId');
    const quantityParam = parseInt(searchParams.get('quantity')) || 1;
    const offerIdParam = searchParams.get('offerId');

    const [directProduct, setDirectProduct] = useState(null);
    const [directOffer, setDirectOffer] = useState(null);
    const [directLoading, setDirectLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
    const [errors, setErrors] = useState({});
    const [orderError, setOrderError] = useState('');

    // Load usePayment hook
    const { processPayment, loading: paymentLoading, error: paymentError, success: paymentSuccess } = usePayment();

    // Fetch direct purchase product/offer details
    useEffect(() => {
        if (!productIdParam) return;

        const loadDirectCheckoutData = async () => {
            setDirectLoading(true);
            setFetchError(null);
            try {
                const productRes = await getProductById(productIdParam);
                setDirectProduct(productRes.product);

                if (offerIdParam) {
                    const offerRes = await getOfferById(offerIdParam);
                    setDirectOffer(offerRes.offer);
                }
            } catch (err) {
                setFetchError(err.message || 'Failed to load checkout details.');
            } finally {
                setDirectLoading(false);
            }
        };

        loadDirectCheckoutData();
    }, [productIdParam, offerIdParam]);

    // Navigate to orders page upon payment success
    useEffect(() => {
        if (paymentSuccess) {
            // Only clear cart if checkout was initiated from Cart
            if (!productIdParam) {
                dispatch(clearCart());
            }
            const timer = setTimeout(() => navigate('/orders'), 3000);
            return () => clearTimeout(timer);
        }
    }, [paymentSuccess, productIdParam, dispatch, navigate]);

    if (!user) return <Navigate to="/login" replace />;

    // Redirect to cart ONLY if there is no direct product purchase and cart is empty
    if (!productIdParam && items.length === 0 && !paymentSuccess) {
        return <Navigate to="/cart" replace />;
    }

    if (directLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center text-white">
                <div className="text-red-500 mb-4 text-3xl">✕</div>
                <h2 className="font-serif text-2xl tracking-widest uppercase mb-2">Error</h2>
                <p className="text-neutral-500 text-sm mb-6">{fetchError}</p>
                <button onClick={() => navigate('/browse')} className="bg-white text-black text-xs font-bold tracking-[0.2em] px-8 py-3 uppercase">
                    Back to Browse
                </button>
            </div>
        );
    }

    // Determine checkout items and total price
    const checkoutItems = productIdParam
        ? (directProduct ? [{
            ...directProduct,
            quantity: quantityParam,
            price: {
                ...directProduct.price,
                amount: directOffer
                    ? (directOffer.status === 'countered' ? directOffer.counterPrice : directOffer.offeredPrice)
                    : directProduct.price.amount
            }
          }] : [])
        : items;

    const total = checkoutItems.reduce((sum, item) => sum + (item.price?.amount || 0) * item.quantity, 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        setOrderError('');
    };

    const validate = () => {
        const errs = {};
        if (!address.street.trim()) errs.street = 'Street address is required';
        if (!address.city.trim()) errs.city = 'City is required';
        if (!address.state.trim()) errs.state = 'State is required';
        if (!address.pincode.trim()) errs.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = 'Pincode must be 6 digits';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validate()) return;
        setOrderError('');

        try {
            // Process payment for each checkout item sequentially
            for (const item of checkoutItems) {
                await processPayment({
                    item,
                    address,
                    user,
                    offerId: (productIdParam && offerIdParam) ? offerIdParam : undefined,
                });
            }
        } catch (err) {
            setOrderError(err.message || 'Payment or order creation failed.');
        }
    };

    if (paymentSuccess) {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center text-white">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <h2 className="font-serif text-3xl tracking-widest uppercase mb-2">Payment Successful!</h2>
                <p className="text-neutral-500 text-xs mt-2">Your order has been confirmed and payment received.</p>
                <p className="text-neutral-400 text-xs tracking-widest uppercase animate-pulse mt-4">
                    Redirecting to orders...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-white">
            <h1 className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping Address */}
                <div className="lg:col-span-2">
                    <h2 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-4">Shipping Address</h2>

                    {(orderError || paymentError) && (
                        <div className="bg-red-950/50 border border-red-900/50 p-3 text-xs text-red-400 mb-4">
                            {orderError || paymentError}
                        </div>
                    )}

                    <div className="bg-[#141414] border border-neutral-800 p-6 space-y-4">
                        <div>
                            <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">Street Address</label>
                            <input type="text" name="street" value={address.street} onChange={handleChange}
                                placeholder="123, MG Road, Near City Mall"
                                className={`w-full bg-[#1c1c1c] border px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none ${errors.street ? 'border-red-800' : 'border-neutral-700 focus:border-neutral-500'
                                    } transition-colors`} />
                            {errors.street && <p className="text-[11px] text-red-500 mt-1">{errors.street}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">City</label>
                                <input type="text" name="city" value={address.city} onChange={handleChange}
                                    placeholder="Mumbai"
                                    className={`w-full bg-[#1c1c1c] border px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none ${errors.city ? 'border-red-800' : 'border-neutral-700 focus:border-neutral-500'
                                        } transition-colors`} />
                                {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">State</label>
                                <input type="text" name="state" value={address.state} onChange={handleChange}
                                    placeholder="Maharashtra"
                                    className={`w-full bg-[#1c1c1c] border px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none ${errors.state ? 'border-red-800' : 'border-neutral-700 focus:border-neutral-500'
                                        } transition-colors`} />
                                {errors.state && <p className="text-[11px] text-red-500 mt-1">{errors.state}</p>}
                            </div>
                        </div>

                        <div className="max-w-[200px]">
                            <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">Pincode</label>
                            <input type="text" name="pincode" value={address.pincode} onChange={handleChange}
                                placeholder="400001" maxLength={6}
                                className={`w-full bg-[#1c1c1c] border px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none ${errors.pincode ? 'border-red-800' : 'border-neutral-700 focus:border-neutral-500'
                                        } transition-colors`} />
                            {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-[#141414] border border-neutral-800 p-6 h-fit sticky top-20">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-4">Order Summary</h3>

                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {checkoutItems.map((item) => (
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

                    {/* Razorpay secured badge */}
                    <div className="flex items-center gap-2 mb-4 p-2 bg-violet-950/20 border border-violet-500/10 rounded-lg">
                        <svg className="w-4 h-4 text-violet-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                        <span className="text-[9px] text-violet-400 font-semibold">Secured by Razorpay</span>
                    </div>

                    <button onClick={handlePlaceOrder} disabled={paymentLoading || checkoutItems.length === 0}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-[0.2em] py-3.5 transition-colors uppercase cursor-pointer disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg shadow-lg shadow-violet-950/20">
                        {paymentLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing Payment...
                            </>
                        ) : `Pay ₹${total.toLocaleString()}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
