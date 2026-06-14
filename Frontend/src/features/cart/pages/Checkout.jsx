import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { clearCart } from '../cartSlice';
import { placeOrder } from '../../orders/services/order.service';
import { getProductById } from '../../products/services/product.service';
import { getOfferById } from '../../offers/services/offer.service';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [success, setSuccess] = useState(false);

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

    if (!user) return <Navigate to="/login" replace />;

    // Redirect to cart ONLY if there is no direct product purchase and cart is empty
    if (!productIdParam && items.length === 0 && !success) {
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
        setIsSubmitting(true);
        setOrderError('');

        try {
            // Place order for each item in the checkout list
            for (const item of checkoutItems) {
                const orderPayload = {
                    productId: item._id,
                    quantity: item.quantity,
                    shippingAddress: {
                        street: address.street.trim(),
                        city: address.city.trim(),
                        state: address.state.trim(),
                        pincode: address.pincode.trim(),
                    },
                };

                // Inject offer ID if this is a negotiated offer direct purchase
                if (productIdParam && offerIdParam) {
                    orderPayload.offerId = offerIdParam;
                }

                await placeOrder(orderPayload);
            }

            // Only clear cart if checkout was initiated from Cart
            if (!productIdParam) {
                dispatch(clearCart());
            }

            setSuccess(true);
            setTimeout(() => navigate('/orders'), 3000);
        } catch (err) {
            setOrderError(err.response?.data?.error || 'Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center text-white">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <h2 className="font-serif text-3xl tracking-widest uppercase mb-2">Order Placed!</h2>
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

                    {orderError && (
                        <div className="bg-red-950/50 border border-red-900/50 p-3 text-xs text-red-400 mb-4">
                            {orderError}
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

                    <button onClick={handlePlaceOrder} disabled={isSubmitting || checkoutItems.length === 0}
                        className="w-full bg-white text-black text-xs font-bold tracking-[0.2em] py-3.5 hover:bg-neutral-200 transition-colors uppercase cursor-pointer disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Placing Order...
                            </>
                        ) : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
