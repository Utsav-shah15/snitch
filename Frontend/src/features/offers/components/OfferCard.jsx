import React from 'react';

const STATUS_STYLES = {
    pending: 'text-yellow-400 border-yellow-900/50 bg-yellow-950/30',
    accepted: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30',
    countered: 'text-blue-400 border-blue-900/50 bg-blue-950/30',
    declined: 'text-red-400 border-red-900/50 bg-red-950/30',
};

/**
 * OfferCard — Renders a single offer with product info, pricing, and action buttons.
 *
 * @param {{ offer: object, onAccept, onDecline, onCounter, actionId, counterInputs, setCounterInputs }} props
 */
const OfferCard = ({ offer, onAccept, onDecline, onCounter, actionId, counterInputs, setCounterInputs }) => {
    return (
        <div className="bg-[#141414] border border-neutral-900 p-5 hover:border-neutral-700 transition-colors">
            <div className="flex items-start gap-4">
                {/* Product image */}
                <div className="w-14 h-14 bg-neutral-900 flex-shrink-0 overflow-hidden">
                    {offer.product?.images?.[0]?.url ? (
                        <img src={offer.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">—</div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <p className="text-sm font-semibold">{offer.product?.title}</p>
                    <p className="text-neutral-500 text-xs mt-0.5">From: <span className="text-neutral-300">{offer.buyer?.fullName}</span></p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div>
                            <span className="text-[9px] text-neutral-500 uppercase block">Listed</span>
                            <span className="text-sm line-through text-neutral-500">₹{offer.product?.price?.amount?.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-neutral-500 uppercase block">Offer</span>
                            <span className="text-base font-bold text-yellow-400">₹{offer.offeredPrice?.toLocaleString()}</span>
                        </div>
                        {offer.counterPrice && (
                            <div>
                                <span className="text-[9px] text-neutral-500 uppercase block">Counter</span>
                                <span className="text-sm text-blue-400">₹{offer.counterPrice?.toLocaleString()}</span>
                            </div>
                        )}
                        <span className={`text-[9px] font-bold px-2 py-0.5 border ${STATUS_STYLES[offer.status]}`}>
                            {offer.status.toUpperCase()}
                        </span>
                    </div>
                    {offer.message && (
                        <p className="text-neutral-600 text-xs mt-2 italic">"{offer.message}"</p>
                    )}
                </div>

                {/* Actions — only for pending offers */}
                {offer.status === 'pending' && (
                    <div className="flex-shrink-0 flex flex-col gap-2 items-end min-w-[140px]">
                        <button onClick={() => onAccept(offer._id)}
                            disabled={actionId === offer._id}
                            className="w-full text-[10px] font-bold tracking-widest uppercase px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50">
                            Accept
                        </button>
                        <div className="flex gap-1 w-full">
                            <input
                                type="number"
                                placeholder="Counter ₹"
                                value={counterInputs[offer._id] || ''}
                                onChange={e => setCounterInputs(p => ({ ...p, [offer._id]: e.target.value }))}
                                className="flex-1 bg-[#1c1c1c] border border-neutral-700 px-2 py-1.5 text-xs text-white outline-none focus:border-neutral-500 min-w-0"
                            />
                            <button onClick={() => onCounter(offer._id)}
                                disabled={actionId === offer._id}
                                className="text-[10px] font-bold uppercase px-3 py-1.5 bg-neutral-700 text-white hover:bg-neutral-600 transition-colors cursor-pointer disabled:opacity-50">
                                →
                            </button>
                        </div>
                        <button onClick={() => onDecline(offer._id)}
                            disabled={actionId === offer._id}
                            className="w-full text-[10px] text-red-500 hover:text-red-400 uppercase tracking-wider px-4 py-1.5 border border-red-900/50 hover:border-red-700 transition-colors cursor-pointer disabled:opacity-50">
                            Decline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfferCard;
