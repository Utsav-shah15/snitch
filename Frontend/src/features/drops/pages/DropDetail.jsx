import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useDrops from '../hooks/useDrops';
import CountdownTimer from '../components/CountdownTimer';
import { getMyOrders } from '../../orders/services/order.service';

const DropDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { currentDrop, loading, error, fetchDropById, registerNotify, changeStatus } = useDrops();

    const [isNotified, setIsNotified] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifMessage, setNotifMessage] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [hasAlreadyPurchased, setHasAlreadyPurchased] = useState(false);

    useEffect(() => {
        fetchDropById(id);
    }, [id, fetchDropById]);

    useEffect(() => {
        if (currentDrop && user) {
            setIsNotified(
                currentDrop.notifiedBuyers?.some((buyerId) => buyerId === user.id || buyerId === user._id) || false
            );
        }
    }, [currentDrop, user]);

    // Check if this buyer already purchased any product from this drop
    useEffect(() => {
        if (!user || !currentDrop || !currentDrop.products?.length) return;
        const isSeller = currentDrop.seller?._id === user._id || currentDrop.seller === user._id;
        if (isSeller) return; // Sellers don't need this check

        const checkDropPurchase = async () => {
            try {
                const res = await getMyOrders();
                const activeOrders = (res.orders || []).filter(o => o.status !== 'cancelled');
                // Collect all product IDs in this drop
                const dropProductIds = currentDrop.products.map(
                    p => p.product?._id?.toString() || p.product?.toString()
                );
                // Check if any active order matches a product in this drop
                const purchased = activeOrders.some(order =>
                    dropProductIds.includes(order.product?._id?.toString() || order.product?.toString())
                );
                setHasAlreadyPurchased(purchased);
            } catch (err) {
                console.error('Failed to check drop purchase history:', err);
            }
        };
        checkDropPurchase();
    }, [user, currentDrop]);

    const handleNotify = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setNotifLoading(true);
        setNotifMessage('');
        try {
            await registerNotify(id);
            setIsNotified(true);
            setNotifMessage("Registered! You'll be notified when this drop goes live.");
        } catch (err) {
            setNotifMessage(err.message || 'Failed to register');
        } finally {
            setNotifLoading(false);
        }
    };

    const handleGoLive = async () => {
        if (!window.confirm('Are you sure you want to release this drop now?')) return;
        setStatusLoading(true);
        try {
            await changeStatus(id, 'live');
            fetchDropById(id); // Reload
        } catch (err) {
            alert(err.message || 'Failed to update status');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleEndDrop = async () => {
        if (!window.confirm('Are you sure you want to end this drop?')) return;
        setStatusLoading(true);
        try {
            await changeStatus(id, 'ended');
            fetchDropById(id); // Reload
        } catch (err) {
            alert(err.message || 'Failed to update status');
        } finally {
            setStatusLoading(false);
        }
    };

    if (loading && !currentDrop) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 px-4 text-center">
                <p className="text-red-400 text-xs font-bold">{error}</p>
                <Link to="/drops" className="text-violet-400 text-xs underline mt-4 block">Back to Drops</Link>
            </div>
        );
    }

    if (!currentDrop) return null;

    const isUpcoming = currentDrop.status === 'scheduled';
    const isLive = currentDrop.status === 'live';
    const isEnded = currentDrop.status === 'ended';
    const sellerId = currentDrop.seller?._id || currentDrop.seller;
    const isSeller = user && sellerId && (sellerId.toString() === user._id?.toString() || sellerId.toString() === user.id?.toString());

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Navigation back */}
            <Link to="/drops" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white mb-8 transition-colors">
                ← Back to Releases
            </Link>

            {/* Main Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
                {/* Left side: Cover Image */}
                <div className="lg:col-span-7">
                    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/80 relative">
                        {currentDrop.coverImage ? (
                            <img
                                src={currentDrop.coverImage}
                                alt={currentDrop.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-800 text-6xl font-black select-none">
                                EXCLUSIVE DROP
                            </div>
                        )}
                        {/* Status Label on image */}
                        <div className="absolute top-4 left-4 z-10">
                            {isLive && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                    Live Now
                                </span>
                            )}
                            {isUpcoming && (
                                <span className="inline-flex items-center px-3 py-1 bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    Upcoming
                                </span>
                            )}
                            {isEnded && (
                                <span className="inline-flex items-center px-3 py-1 bg-neutral-800 text-neutral-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                                    Ended
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Drop Details & Timer */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                    <div>
                        {/* Seller header */}
                        <div className="flex items-center gap-3 mb-4">
                            {currentDrop.seller?.sellerProfile?.avatar ? (
                                <img
                                    src={currentDrop.seller.sellerProfile.avatar}
                                    alt=""
                                    className="w-6 h-6 rounded-full object-cover border border-neutral-800"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">
                                    S
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Curated By</p>
                                <p className="text-xs text-neutral-300 font-semibold">{currentDrop.seller?.sellerProfile?.shopName || currentDrop.seller?.fullName}</p>
                            </div>
                        </div>

                        <h1 className="font-serif text-2xl md:text-3xl uppercase tracking-wider text-white">
                            {currentDrop.title}
                        </h1>

                        <p className="text-xs text-neutral-400 leading-relaxed mt-4 bg-neutral-950/20 p-4 border border-neutral-900 rounded-xl">
                            {currentDrop.description || 'No description provided for this exclusive curation.'}
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-900">
                        {isUpcoming ? (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-black block mb-2">Starts In</span>
                                    <CountdownTimer targetDate={currentDrop.scheduledAt} onEnd={() => fetchDropById(id)} />
                                </div>

                                {!isSeller && (
                                    <button
                                        onClick={handleNotify}
                                        disabled={isNotified || notifLoading}
                                        className={`w-full py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                                            isNotified
                                                ? 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                                                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/20'
                                        }`}
                                    >
                                        {notifLoading ? 'Registering...' : isNotified ? 'Registered for Live Alert' : 'Get Notified When Live'}
                                    </button>
                                )}
                            </div>
                        ) : isLive ? (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">⚡ Release is Active</span>
                                <p className="text-xs text-neutral-400">First come, first served. Limited stock available.</p>
                            </div>
                        ) : (
                            <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Release has ended</span>
                        )}

                        {/* Seller actions */}
                        {isSeller && (
                            <div className="flex gap-3 mt-6">
                                {isUpcoming && (
                                    <button
                                        onClick={handleGoLive}
                                        disabled={statusLoading}
                                        className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors cursor-pointer"
                                    >
                                        Go Live Now
                                    </button>
                                )}
                                {!isEnded && (
                                    <button
                                        onClick={handleEndDrop}
                                        disabled={statusLoading}
                                        className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-red-650 hover:bg-red-600 text-white border border-red-500/20 rounded-lg transition-colors cursor-pointer"
                                    >
                                        End Release
                                    </button>
                                )}
                            </div>
                        )}

                        {notifMessage && (
                            <p className="text-[10px] font-semibold text-violet-400 mt-3">{notifMessage}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Products grid */}
            <div>
                <h2 className="font-serif text-lg md:text-xl uppercase tracking-widest border-b border-neutral-900 pb-3 mb-6">
                    Featured Items ({currentDrop.products?.length || 0})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentDrop.products?.map((item) => {
                        const product = item.product;
                        const isSoldOut = product.stock <= 0 || product.status === 'sold';

                        return (
                            <div
                                key={product._id}
                                className="group relative overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md transition-all duration-300 hover:border-neutral-800"
                            >
                                {/* Lock overlay if upcoming and not seller */}
                                {isUpcoming && !isSeller && (
                                    <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
                                        <span className="text-2xl mb-2">🔒</span>
                                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">Locked</p>
                                        <p className="text-[9px] text-neutral-500 mt-1 max-w-[150px]">Unlocked when release goes live</p>
                                    </div>
                                )}

                                {/* Product Details (no link — drop purchases must go through FCFS) */}
                                <div>
                                    {/* Product Image */}
                                    <div className="aspect-square bg-neutral-900 overflow-hidden relative">
                                        {product.images?.[0]?.url ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-950 flex items-center justify-center text-xs text-neutral-600 font-bold uppercase">
                                                No Image
                                            </div>
                                        )}

                                        {/* Sold label */}
                                        {isSoldOut && (
                                            <div className="absolute top-4 left-4 px-2 py-1 bg-red-900/80 text-white text-[9px] font-black uppercase tracking-wider rounded">
                                                Sold Out
                                            </div>
                                        )}
                                        {/* Size badge */}
                                        {product.size && (
                                            <div className="absolute bottom-4 right-4 px-2 py-1 bg-neutral-950/80 border border-neutral-800/40 rounded text-[9px] font-bold text-neutral-300">
                                                Size: {product.size}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4 pb-0">
                                        <h3 className="text-xs font-bold text-neutral-200 line-clamp-1">
                                            {product.title}
                                        </h3>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs font-bold text-violet-400">₹{product.price?.amount?.toLocaleString()}</p>
                                            <span className="text-[9px] text-neutral-500 uppercase font-semibold">{product.condition}</span>
                                        </div>
                                        {product.description && (
                                            <p className="text-[10px] text-neutral-600 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 pt-0">
                                    {/* Action button if Live and user is not the seller */}
                                    {isLive && !isUpcoming && !isSeller && (
                                        <div className="mt-4 pt-3 border-t border-neutral-900/60">
                                            {isSoldOut ? (
                                                <button
                                                    disabled
                                                    className="w-full py-2 text-[10px] font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-600 rounded-lg"
                                                >
                                                    Sold Out
                                                </button>
                                            ) : hasAlreadyPurchased ? (
                                                <button
                                                    disabled
                                                    className="w-full py-2 text-[10px] font-bold uppercase tracking-wider bg-neutral-900 border border-amber-900/40 text-amber-600/70 rounded-lg cursor-not-allowed"
                                                    title="You have already purchased 1 item from this drop release"
                                                >
                                                    ✓ Already Purchased
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        navigate(`/checkout?productId=${product._id}&quantity=1`);
                                                    }}
                                                    className="w-full py-2 text-[10px] font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-500 text-white rounded-lg cursor-pointer transition-colors shadow-md shadow-violet-950/15"
                                                >
                                                    Buy Now FCFS
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DropDetail;
