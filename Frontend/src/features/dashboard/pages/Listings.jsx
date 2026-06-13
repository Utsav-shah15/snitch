import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useProducts from '../../products/hooks/useProducts';
import DashboardSidebar from '../components/DashboardSidebar';

const CONDITION_COLORS = {
    'New': 'text-emerald-400 bg-emerald-950/50',
    'Like New': 'text-blue-400 bg-blue-950/50',
    'Good': 'text-yellow-400 bg-yellow-950/50',
    'Fair': 'text-orange-400 bg-orange-950/50',
};

const STATUS_COLORS = {
    'active': 'text-emerald-400',
    'draft': 'text-neutral-400',
    'sold': 'text-red-400',
};

const Listings = () => {
    const { user } = useSelector((state) => state.auth);
    const { listings, loading, fetchMyListings, deleteProduct } = useProducts();
    const [deletingId, setDeletingId] = useState(null);
    const [filter, setFilter] = useState('all');

    if (!user) return <Navigate to="/login" replace />;
    if (!user.isSeller) return <Navigate to="/become-seller" replace />;

    useEffect(() => {
        fetchMyListings();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this listing? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            await deleteProduct(id);
        } catch (e) {
            alert(e.message || 'Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = filter === 'all' ? listings : listings.filter(p => p.status === filter);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Sidebar + main layout */}
            <div className="flex">
                <DashboardSidebar />

                {/* Main */}
                <main className="flex-1 p-6 lg:p-10 max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-serif text-2xl tracking-widest uppercase">My Listings</h1>
                            <p className="text-neutral-500 text-xs mt-1">{listings.length} total products</p>
                        </div>
                        <Link to="/dashboard/listings/new"
                            className="bg-white text-black text-[10px] font-bold tracking-widest px-6 py-2.5 hover:bg-neutral-200 transition-colors uppercase">
                            + New Listing
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6">
                        {['all', 'active', 'draft', 'sold'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 border transition-colors cursor-pointer ${filter === f ? 'border-white text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-neutral-800">
                            <p className="text-neutral-600 text-sm">No listings found.</p>
                            <Link to="/dashboard/listings/new" className="text-white text-xs underline mt-2 inline-block">Create your first listing →</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(product => (
                                <div key={product._id} className="flex items-center gap-4 bg-[#141414] border border-neutral-900 p-4 hover:border-neutral-700 transition-colors">
                                    {/* Image */}
                                    <div className="w-16 h-16 bg-neutral-900 flex-shrink-0 overflow-hidden">
                                        {product.images?.[0]?.url ? (
                                            <img src={product.images[0].url} alt={product.title}
                                                className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">No img</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{product.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-neutral-400 text-xs">₹{product.price?.amount?.toLocaleString()}</span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 ${CONDITION_COLORS[product.condition] || ''}`}>
                                                {product.condition}
                                            </span>
                                            <span className={`text-[9px] font-semibold uppercase ${STATUS_COLORS[product.status] || ''}`}>
                                                {product.status}
                                            </span>
                                            <span className="text-neutral-600 text-[9px]">Stock: {product.stock}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Link to={`/product/${product._id}`}
                                            className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-wider transition-colors px-3 py-1.5 border border-neutral-800 hover:border-neutral-600">
                                            View
                                        </Link>
                                        <Link to={`/dashboard/listings/edit/${product._id}`}
                                            className="text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider transition-colors px-3 py-1.5 border border-neutral-800 hover:border-neutral-600">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            disabled={deletingId === product._id}
                                            className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-wider transition-colors px-3 py-1.5 border border-red-900/50 hover:border-red-700 disabled:opacity-40 cursor-pointer">
                                            {deletingId === product._id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Listings;
