import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import useProduct from '../hooks/useProduct';
import ImageGallery from '../components/ImageGallery';
import { addToCart } from '../../cart/cartSlice';
import useOffers from '../../offers/hooks/useOffers';
import OutfitSuggestions from '../components/OutfitSuggestions';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const { product, loading, error, fetchProduct } = useProduct();
    const { makeOffer } = useOffers();

    const [selectedImage, setSelectedImage] = useState(0);
    const [added, setAdded] = useState(false);

    // Offer states
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [submittingOffer, setSubmittingOffer] = useState(false);
    const [formError, setFormError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        fetchProduct(id).catch(() => navigate('/browse'));
    }, [id]);

    const handleAddToCart = () => {
        if (!user) return navigate('/login');
        dispatch(addToCart(product));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (!user) return navigate('/login');
        navigate(`/checkout?productId=${product._id}&quantity=1`);
    };

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitSuccess(false);

        const price = parseFloat(offerPrice);
        if (!price || price <= 0) {
            setFormError('Please enter a valid price greater than 0.');
            return;
        }

        if (price >= product.price.amount) {
            setFormError(`Offer price must be lower than the listed price of ₹${product.price.amount.toLocaleString()}.`);
            return;
        }

        setSubmittingOffer(true);
        try {
            await makeOffer({
                productId: product._id,
                offeredPrice: price,
                message: offerMessage.trim()
            });
            setSubmitSuccess(true);
            setTimeout(() => {
                setShowOfferForm(false);
                setOfferPrice('');
                setOfferMessage('');
                setSubmitSuccess(false);
            }, 2000);
        } catch (err) {
            setFormError(err.message || 'Failed to submit offer.');
        } finally {
            setSubmittingOffer(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="aspect-square bg-neutral-800 animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-6 bg-neutral-800 rounded w-1/2 animate-pulse" />
                        <div className="h-8 bg-neutral-800 rounded w-1/3 animate-pulse" />
                        <div className="h-20 bg-neutral-800 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] text-neutral-500 mb-6 uppercase tracking-wider">
                <button onClick={() => navigate('/browse')} className="hover:text-white transition-colors cursor-pointer">Browse</button>
                <span>/</span>
                <span className="text-neutral-400">{product.category}</span>
                <span>/</span>
                <span className="text-white">{product.title}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Images */}
                <ImageGallery
                    images={product.images}
                    selectedIndex={selectedImage}
                    onSelect={setSelectedImage}
                />

                {/* Details */}
                <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">{product.category}</p>
                    <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>
                    <p className="text-3xl font-bold text-white mb-6">
                        {product.price?.currency === 'INR' ? '₹' : '$'}{product.price?.amount?.toLocaleString()}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                            Size: {product.size}
                        </span>
                        <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                            {product.condition}
                        </span>
                        <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                            {product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2">Description</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>

                    {/* Add to Cart */}
                    {(() => {
                        const sellerId = product.seller?._id || product.seller?.id || product.seller;
                        const isOwnProduct = user && sellerId && (sellerId === user.id || sellerId === user._id);
                        
                        if (isOwnProduct) {
                            return (
                                <button disabled className="w-full bg-neutral-900 border border-neutral-800 text-neutral-500 py-4 text-xs font-bold tracking-[0.2em] uppercase cursor-not-allowed">
                                    Your Listing (Cannot Purchase)
                                </button>
                            );
                        }
                        
                        if (product.stock > 0) {
                            return (
                                <div className="space-y-3">
                                    <button onClick={handleAddToCart}
                                        className={`w-full py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                                            added
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white text-black hover:bg-neutral-200'
                                        }`}>
                                        {added ? '✓ Added to Cart' : 'Add to Cart'}
                                    </button>
                                    <button onClick={handleBuyNow}
                                        className="w-full bg-transparent border border-neutral-700 hover:border-neutral-500 text-white py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all">
                                        Buy Now
                                    </button>
                                    <button onClick={() => { if (!user) return navigate('/login'); setShowOfferForm(true); }}
                                        className="w-full bg-transparent border border-neutral-700 hover:border-neutral-500 text-white py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all">
                                        Make an Offer
                                    </button>
                                </div>
                            );
                        }
                        
                        return (
                            <button disabled className="w-full bg-neutral-800 text-neutral-500 py-4 text-xs font-bold tracking-[0.2em] uppercase cursor-not-allowed">
                                Sold Out
                            </button>
                        );
                    })()}

                    {/* Seller Info */}
                    {product.seller && (
                        <div className="mt-8 bg-[#141414] border border-neutral-800 p-4">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Sold by</p>
                            <p className="text-sm font-semibold text-white">
                                {product.seller.sellerProfile?.shopName || product.seller.fullName}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Outfit Suggestions */}
            <OutfitSuggestions productId={id} />

            {/* Offer Modal */}
            {showOfferForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#141414] border border-neutral-800 p-6 max-w-sm w-full relative">
                        <button onClick={() => { setShowOfferForm(false); setOfferPrice(''); setOfferMessage(''); setFormError(''); }}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="font-serif text-lg tracking-widest uppercase mb-2">Make an Offer</h3>
                        <p className="text-[10px] text-neutral-500 mb-5 leading-normal">
                            Suggest a negotiation price. Offers must be lower than the listed price of ₹{product.price?.amount?.toLocaleString()}.
                        </p>
                        <form onSubmit={handleOfferSubmit} className="space-y-4">
                            <div>
                                <label className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">Your Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={offerPrice}
                                    onChange={e => setOfferPrice(e.target.value)}
                                    className="w-full bg-[#1c1c1c] border border-neutral-800 focus:border-neutral-600 px-3 py-2 text-xs text-white outline-none"
                                    placeholder="e.g. 1200"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">Message (Optional)</label>
                                <textarea
                                    value={offerMessage}
                                    onChange={e => setOfferMessage(e.target.value)}
                                    className="w-full bg-[#1c1c1c] border border-neutral-800 focus:border-neutral-600 px-3 py-2 text-xs text-white outline-none resize-none h-16"
                                    placeholder="Message for seller..."
                                />
                            </div>
                            {formError && (
                                <p className="text-red-500 text-[10px] font-medium">{formError}</p>
                            )}
                            {submitSuccess ? (
                                <p className="text-green-500 text-[10px] font-semibold">✓ Offer submitted successfully!</p>
                            ) : (
                                <button type="submit" disabled={submittingOffer}
                                    className="w-full bg-white text-black py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer">
                                    {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
