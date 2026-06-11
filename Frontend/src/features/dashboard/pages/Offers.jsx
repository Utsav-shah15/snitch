import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useOffers from '../../offers/hooks/useOffers';
import DashboardSidebar from '../components/DashboardSidebar';

const STATUS_STYLES = {
    pending: 'text-yellow-400 border-yellow-900/50 bg-yellow-950/30',
    accepted: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30',
    countered: 'text-blue-400 border-blue-900/50 bg-blue-950/30',
    declined: 'text-red-400 border-red-900/50 bg-red-950/30',
};

const Offers = () => {
    const { user } = useSelector((state) => state.auth);
    const { receivedOffers, loading, fetchReceivedOffers, acceptOffer, counterOffer, declineOffer } = useOffers();
    const [filter, setFilter] = useState('pending');
    const [actionId, setActionId] = useState(null);
    const [counterInputs, setCounterInputs] = useState({});

    if (!user) return <Navigate to="/login" replace />;
    if (!user.isSeller) return <Navigate to="/become-seller" replace />;

    useEffect(() => { fetchReceivedOffers(); }, []);

    const handleAccept = async (id) => {
        setActionId(id);
        try {
            await acceptOffer(id);
        } catch (e) { alert(e.message || 'Failed'); }
        finally { setActionId(null); }
    };

    const handleDecline = async (id) => {
        setActionId(id);
        try {
            await declineOffer(id);
        } catch (e) { alert(e.message || 'Failed'); }
        finally { setActionId(null); }
    };

    const handleCounter = async (id) => {
        const price = parseFloat(counterInputs[id]);
        if (!price || price <= 0) return alert('Enter a valid counter price');
        setActionId(id);
        try {
            await counterOffer(id, price);
        } catch (e) { alert(e.message || 'Failed'); }
        finally { setActionId(null); }
    };

    const filtered = filter === 'all' ? receivedOffers : receivedOffers.filter(o => o.status === filter);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            <DashboardSidebar />

            {/* Main */}
            <main className="flex-1 p-6 lg:p-10">
                <div className="max-w-4xl">
                    <div className="mb-8">
                        <h1 className="font-serif text-2xl tracking-widest uppercase">Buyer Offers</h1>
                        <p className="text-neutral-500 text-xs mt-1">{receivedOffers.length} total offers received</p>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6">
                        {['pending', 'countered', 'accepted', 'declined', 'all'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 border transition-colors cursor-pointer ${filter === f ? 'border-white text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center h-64 items-center">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-neutral-800">
                            <p className="text-neutral-600 text-sm">No {filter} offers.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map(offer => (
                                <div key={offer._id} className="bg-[#141414] border border-neutral-900 p-5 hover:border-neutral-700 transition-colors">
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
                                                <button onClick={() => handleAccept(offer._id)}
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
                                                    <button onClick={() => handleCounter(offer._id)}
                                                        disabled={actionId === offer._id}
                                                        className="text-[10px] font-bold uppercase px-3 py-1.5 bg-neutral-700 text-white hover:bg-neutral-600 transition-colors cursor-pointer disabled:opacity-50">
                                                        →
                                                    </button>
                                                </div>
                                                <button onClick={() => handleDecline(offer._id)}
                                                    disabled={actionId === offer._id}
                                                    className="w-full text-[10px] text-red-500 hover:text-red-400 uppercase tracking-wider px-4 py-1.5 border border-red-900/50 hover:border-red-700 transition-colors cursor-pointer disabled:opacity-50">
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Offers;
