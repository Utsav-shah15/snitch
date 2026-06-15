import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useDrops from '../hooks/useDrops';
import useProducts from '../../products/hooks/useProducts';
import DropCard from '../components/DropCard';

const Drops = () => {
    const { user } = useSelector((state) => state.auth);
    const { drops, loading, error, fetchAllDrops, createNewDrop } = useDrops();
    const { listings, fetchMyListings } = useProducts();

    // UI state
    const [activeTab, setActiveTab] = useState('live'); // 'live' | 'upcoming' | 'ended'
    const [showModal, setShowModal] = useState(false);

    // Form state for creating a drop
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]); // Array of { product: id, quantity: number }
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAllDrops();
        if (user?.isSeller) {
            fetchMyListings();
        }
    }, [user, fetchAllDrops, fetchMyListings]);

    // Handle checkboxes for products
    const handleProductSelect = (productId) => {
        setSelectedProducts((prev) => {
            const exists = prev.find((p) => p.product === productId);
            if (exists) {
                return prev.filter((p) => p.product !== productId);
            } else {
                return [...prev, { product: productId, quantity: 1 }];
            }
        });
    };

    const handleQuantityChange = (productId, qty) => {
        setSelectedProducts((prev) =>
            prev.map((p) => (p.product === productId ? { ...p, quantity: Math.max(1, parseInt(qty) || 1) } : p))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!title || !scheduledAt || selectedProducts.length === 0) {
            setFormError('Title, scheduled date, and at least one product are required.');
            return;
        }

        setSubmitting(true);
        try {
            await createNewDrop({
                title,
                description,
                scheduledAt,
                coverImage,
                products: selectedProducts,
            });
            setFormSuccess('Drop scheduled successfully!');
            // Reset form
            setTitle('');
            setDescription('');
            setScheduledAt('');
            setCoverImage('');
            setSelectedProducts([]);
            // Reload drops
            fetchAllDrops();
            setTimeout(() => {
                setShowModal(false);
                setFormSuccess('');
            }, 1500);
        } catch (err) {
            setFormError(err.message || 'Failed to schedule drop');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter drops by tab
    const filteredDrops = drops.filter((drop) => {
        const now = new Date();
        const scheduledTime = new Date(drop.scheduledAt);

        if (activeTab === 'live') {
            return drop.status === 'live' || (drop.status === 'scheduled' && now >= scheduledTime);
        }
        if (activeTab === 'upcoming') {
            return drop.status === 'scheduled' && now < scheduledTime;
        }
        if (activeTab === 'ended') {
            return drop.status === 'ended';
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="relative mb-12 py-12 px-6 md:px-12 rounded-3xl overflow-hidden border border-neutral-900 bg-gradient-to-r from-neutral-950 to-neutral-900/60 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Background lighting */}
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">Exclusive Releases</span>
                    <h1 className="font-serif text-3xl md:text-5xl uppercase tracking-wider mt-2">Live Drops</h1>
                    <p className="text-xs text-neutral-400 mt-2 max-w-lg leading-relaxed">
                        Access exclusive, limited-run fashion releases from verified sellers. Schedule notifications to secure your item FCFS.
                    </p>
                </div>

                {user?.isSeller && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-3 text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg shadow-violet-950/20 transition-all self-start md:self-auto cursor-pointer"
                    >
                        Schedule a Drop
                    </button>
                )}
            </div>

            {/* Tabs & Controls */}
            <div className="flex border-b border-neutral-900 mb-8 pb-px">
                {['live', 'upcoming', 'ended'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                            activeTab === tab
                                ? 'border-violet-500 text-white'
                                : 'border-transparent text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        {tab === 'live' ? '⚡ Live Now' : tab === 'upcoming' ? '⏳ Upcoming' : '⏹️ Ended'}
                    </button>
                ))}
            </div>

            {/* Error or Loading */}
            {loading && drops.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </div>
            ) : error ? (
                <div className="text-center py-16 border border-neutral-900 rounded-2xl bg-neutral-950/40">
                    <p className="text-red-400 text-xs font-semibold">{error}</p>
                </div>
            ) : filteredDrops.length === 0 ? (
                <div className="text-center py-20 border border-neutral-900 rounded-2xl bg-neutral-950/20">
                    <span className="text-3xl">🏜️</span>
                    <p className="text-neutral-500 text-xs mt-3 uppercase tracking-wider">No drops found in this category.</p>
                </div>
            ) : (
                /* Drops Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDrops.map((drop) => (
                        <DropCard key={drop._id} drop={drop} onNotifySuccess={fetchAllDrops} />
                    ))}
                </div>
            )}

            {/* Drop Scheduling Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8 shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">Schedule Drop</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-neutral-500 hover:text-white cursor-pointer text-sm font-bold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 flex-1 space-y-5">
                            {/* Error / Success Alerts */}
                            {formError && (
                                <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 text-[10px] font-semibold">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                                    {formSuccess}
                                </div>
                            )}

                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Drop Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Midnight Vintage Leather Release"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide details about the curation style or exclusivity."
                                    rows="3"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Scheduled Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Cover Image URL</label>
                                    <input
                                        type="text"
                                        value={coverImage}
                                        onChange={(e) => setCoverImage(e.target.value)}
                                        placeholder="Paste image link"
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Select Products */}
                            <div>
                                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                    Select Products ({selectedProducts.length} chosen)
                                </label>
                                <div className="max-h-40 overflow-y-auto divide-y divide-neutral-900 border border-neutral-800 rounded-xl bg-neutral-950 p-2 scrollbar-thin">
                                    {listings.length === 0 ? (
                                        <p className="text-center text-[10px] text-neutral-500 py-6">You have no active listings. Create listings first!</p>
                                    ) : (
                                        listings.map((prod) => {
                                            const isChecked = selectedProducts.some((p) => p.product === prod._id);
                                            const selectedItem = selectedProducts.find((p) => p.product === prod._id);

                                            return (
                                                <div key={prod._id} className="flex items-center justify-between py-2.5 px-2">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleProductSelect(prod._id)}
                                                            className="rounded border-neutral-800 bg-neutral-900 text-violet-600 focus:ring-0 w-3.5 h-3.5"
                                                        />
                                                        <div className="flex gap-2 items-center">
                                                            {prod.images?.[0] && (
                                                                <img
                                                                    src={prod.images[0]}
                                                                    alt=""
                                                                    className="w-6 h-6 object-cover rounded bg-neutral-900"
                                                                />
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-semibold text-white truncate max-w-[150px]">{prod.title}</p>
                                                                <p className="text-[9px] text-neutral-500">₹{prod.price?.amount}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isChecked && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[9px] text-neutral-500">Qty:</span>
                                                            <input
                                                                type="number"
                                                                value={selectedItem?.quantity || 1}
                                                                onChange={(e) => handleQuantityChange(prod._id, e.target.value)}
                                                                min="1"
                                                                className="w-12 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-[10px] text-center focus:outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || listings.length === 0}
                                className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-xl transition-colors cursor-pointer"
                            >
                                {submitting ? 'Creating scheduled release...' : 'Submit Release Schedule'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drops;
