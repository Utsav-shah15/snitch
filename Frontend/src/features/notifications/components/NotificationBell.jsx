import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Toggle dropdown
    const toggleDropdown = () => setIsOpen((prev) => !prev);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format date nicely
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    // Handle notification item click
    const handleItemClick = (notif) => {
        markAsRead(notif._id);
        setIsOpen(false);

        // Routing based on type
        if (notif.type === 'offer') {
            navigate('/dashboard/offers');
        } else if (notif.type === 'order') {
            const isSellerNotif = 
                notif.data?.role === 'seller' || 
                notif.title?.toLowerCase().includes('received') || 
                notif.title?.toLowerCase().includes('released') ||
                notif.message?.toLowerCase().includes('received') ||
                notif.message?.toLowerCase().includes('released');

            if (isSellerNotif) {
                navigate('/dashboard/orders');
            } else {
                navigate('/orders');
            }
        } else if (notif.type === 'drop') {
            const dropId = notif.data?.dropId || notif.data?.get?.('dropId');
            if (dropId) {
                navigate(`/drops/${dropId}`);
            } else {
                navigate('/drops');
            }
        } else if (notif.type === 'royalty') {
            navigate('/dashboard/wallet');
        }
    };

    // Get type icon/color
    const getTypeStyles = (type) => {
        switch (type) {
            case 'order':
                return { icon: '📦', color: 'text-emerald-400 bg-emerald-500/10' };
            case 'drop':
                return { icon: '🔥', color: 'text-violet-400 bg-violet-500/10' };
            case 'offer':
                return { icon: '💬', color: 'text-amber-400 bg-amber-500/10' };
            case 'royalty':
                return { icon: '💸', color: 'text-cyan-400 bg-cyan-500/10' };
            default:
                return { icon: '🔔', color: 'text-neutral-400 bg-neutral-500/10' };
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
                aria-label="Notifications"
            >
                <svg className="w-5 h-5 animate-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>

                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-neutral-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-md shadow-2xl z-50 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-900 bg-neutral-950/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-neutral-900 scrollbar-thin">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <span className="text-2xl mb-2">📭</span>
                                <p className="text-xs text-neutral-500">All caught up! No notifications yet.</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const styles = getTypeStyles(notif.type);
                                return (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleItemClick(notif)}
                                        className={`flex gap-3 p-4 hover:bg-neutral-900/60 cursor-pointer transition-colors ${
                                            !notif.isRead ? 'bg-neutral-900/20' : ''
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm shrink-0 ${styles.color}`}>
                                            {styles.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <h4 className={`text-xs truncate ${!notif.isRead ? 'font-bold text-white' : 'font-medium text-neutral-300'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[8px] text-neutral-500 whitespace-nowrap pt-0.5">
                                                    {formatTime(notif.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>

                                        {/* Unread Indicator Dot */}
                                        {!notif.isRead && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 self-center" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
