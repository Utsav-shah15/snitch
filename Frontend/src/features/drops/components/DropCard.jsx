import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CountdownTimer from './CountdownTimer';
import useDrops from '../hooks/useDrops';

const DropCard = ({ drop, onNotifySuccess }) => {
    const { user } = useSelector((state) => state.auth);
    const { registerNotify } = useDrops();
    const [isNotified, setIsNotified] = useState(
        drop.notifiedBuyers?.some((id) => id === user?.id || id === user?._id) || false
    );
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifMessage, setNotifMessage] = useState('');

    const handleNotify = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setNotifMessage('Please log in to register');
            return;
        }

        setNotifLoading(true);
        setNotifMessage('');

        try {
            await registerNotify(drop._id);
            setIsNotified(true);
            setNotifMessage('Registered! We will notify you.');
            if (onNotifySuccess) onNotifySuccess();
        } catch (error) {
            setNotifMessage(error.message || 'Failed to register');
        } finally {
            setNotifLoading(false);
        }
    };

    const isUpcoming = drop.status === 'scheduled';
    const isLive = drop.status === 'live';
    const isEnded = drop.status === 'ended';

    const sellerId = drop.seller?._id || drop.seller;
    const isSeller = user && sellerId && (sellerId.toString() === user._id?.toString() || sellerId.toString() === user.id?.toString());

    return (
        <Link
            to={`/drops/${drop._id}`}
            className="group block overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md transition-all duration-300 hover:border-neutral-800 hover:bg-neutral-900/20 hover:shadow-2xl hover:shadow-violet-950/10 cursor-pointer"
        >
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                {drop.coverImage ? (
                    <img
                        src={drop.coverImage}
                        alt={drop.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-800 text-6xl font-black select-none">
                        SNITCH DROP
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                    {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-950/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            Live Now
                        </span>
                    )}
                    {isUpcoming && (
                        <span className="inline-flex items-center px-3 py-1 bg-violet-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-violet-950/30">
                            Upcoming
                        </span>
                    )}
                    {isEnded && (
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-800/95 backdrop-blur-sm text-neutral-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                            Ended
                        </span>
                    )}
                </div>

                {/* Item count */}
                <div className="absolute bottom-4 right-4 z-10 px-2 py-1 bg-neutral-950/80 backdrop-blur-md rounded-md border border-neutral-800/40 text-[9px] font-bold text-neutral-300">
                    {drop.products?.length || 0} {drop.products?.length === 1 ? 'Product' : 'Products'}
                </div>
            </div>

            {/* Details Section */}
            <div className="p-5 flex flex-col justify-between">
                <div>
                    {/* Seller details */}
                    <div className="flex items-center gap-2 mb-2">
                        {drop.seller?.sellerProfile?.avatar ? (
                            <img
                                src={drop.seller.sellerProfile.avatar}
                                alt={drop.seller.sellerProfile.shopName}
                                className="w-4 h-4 rounded-full object-cover border border-neutral-800"
                            />
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 text-[8px] flex items-center justify-center font-bold">
                                S
                            </div>
                        )}
                        <span className="text-[10px] text-neutral-500 font-medium tracking-wide">
                            {drop.seller?.sellerProfile?.shopName || drop.seller?.fullName}
                        </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
                        {drop.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
                        {drop.description || 'No description provided.'}
                    </p>
                </div>

                {/* Footer status / Countdown */}
                <div className="mt-5 pt-4 border-t border-neutral-900/60 flex items-center justify-between gap-4">
                    {isUpcoming ? (
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-black">Starts In</span>
                            <CountdownTimer targetDate={drop.scheduledAt} />
                        </div>
                    ) : isLive ? (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Happening now</span>
                            <span className="text-xs font-black text-white">Don't miss out!</span>
                        </div>
                    ) : (
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Drop closed</span>
                    )}

                    {/* Action button */}
                    {isUpcoming && !isEnded && !isSeller && (
                        <button
                            onClick={handleNotify}
                            disabled={isNotified || notifLoading}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                                isNotified
                                    ? 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/20'
                            }`}
                        >
                            {notifLoading ? 'Saving...' : isNotified ? 'Registered' : 'Notify Me'}
                        </button>
                    )}
                    {isUpcoming && !isEnded && isSeller && (
                        <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-500 rounded-lg">
                            My Drop
                        </span>
                    )}

                    {isLive && (
                        <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer transition-all shadow-lg shadow-red-950/25">
                            Enter Drop
                        </span>
                    )}
                </div>

                {notifMessage && (
                    <div className="text-[9px] font-medium text-violet-400 mt-2 text-right">
                        {notifMessage}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default DropCard;
