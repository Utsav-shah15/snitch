import React, { useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useOffers from '../hooks/useOffers';

const STATUS_STYLES = {
    pending: 'text-yellow-400 border-yellow-900/50 bg-yellow-950/30',
    accepted: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30',
    countered: 'text-blue-400 border-blue-900/50 bg-blue-950/30',
    declined: 'text-red-400 border-red-900/50 bg-red-950/30',
};

const MyOffers = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { myOffers, loading, fetchMyOffers } = useOffers();

    if (!user) return <Navigate to="/login" replace />;

    useEffect(() => {
        fetchMyOffers();
    }, [fetchMyOffers]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="font-serif text-2xl tracking-widest uppercase">My Offers</h1>
                <p className="text-neutral-500 text-xs mt-1">Offers you've made on listings</p>
            </div>

            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            ) : myOffers.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-800 bg-[#141414]/30">
                    <svg className="w-12 h-12 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                    </svg>
                    <p className="text-neutral-500 text-sm mb-4">You haven't made any offers yet.</p>
                    <Link to="/browse" className="bg-white text-black text-[10px] font-bold tracking-[0.2em] px-6 py-2.5 uppercase inline-block hover:bg-neutral-200 transition-colors">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {myOffers.map((offer) => {
                        const product = offer.product;
                        const isCounteredOrAccepted = offer.status === 'accepted' || offer.status === 'countered';
                        const checkoutPrice = offer.status === 'countered' ? offer.counterPrice : offer.offeredPrice;

                        return (
                            <div key={offer._id} className="bg-[#141414] border border-neutral-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-850 transition-all">
                                <div className="flex items-start gap-4">
                                    {/* Image */}
                                    <Link to={`/product/${product?._id}`} className="w-16 h-16 bg-neutral-900 shrink-0 overflow-hidden block">
                                        {product?.images?.[0]?.url ? (
                                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">—</div>
                                        )}
                                    </Link>

                                    {/* Details */}
                                    <div>
                                        <Link to={`/product/${product?._id}`} className="text-sm font-semibold text-white hover:text-neutral-300 block mb-1">
                                            {product?.title || 'Unknown Product'}
                                        </Link>
                                        <p className="text-[10px] text-neutral-500 mb-2">Seller: {offer.seller?.fullName}</p>
                                        
                                        <div className="flex items-center gap-4 text-xs">
                                            <div>
                                                <span className="text-[9px] text-neutral-500 uppercase block">Listed</span>
                                                <span className="line-through text-neutral-500">₹{product?.price?.amount?.toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-neutral-500 uppercase block">Your Offer</span>
                                                <span className="font-semibold text-white">₹{offer.offeredPrice?.toLocaleString()}</span>
                                            </div>
                                            {offer.counterPrice && (
                                                <div>
                                                    <span className="text-[9px] text-neutral-500 uppercase block">Counter Price</span>
                                                    <span className="font-semibold text-blue-400">₹{offer.counterPrice?.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3 md:min-w-[150px]">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${STATUS_STYLES[offer.status] || 'text-white border-neutral-800'}`}>
                                        {offer.status.toUpperCase()}
                                    </span>

                                    {isCounteredOrAccepted && (
                                        <button
                                            onClick={() => navigate(`/checkout?productId=${product?._id}&quantity=1&offerId=${offer._id}`)}
                                            className="text-[10px] font-bold tracking-wider uppercase px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                                        >
                                            Buy for ₹{checkoutPrice?.toLocaleString()}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOffers;
