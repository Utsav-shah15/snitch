import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import useAiSearch from '../../ai/hooks/useAiSearch';

const Browse = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, loading, fetchAllProducts } = useProducts();
    const { user } = useSelector((state) => state.auth);

    // Filters
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        size: searchParams.get('size') || '',
        condition: searchParams.get('condition') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || '',
    });

    // AI Smart Search
    const [smartSearch, setSmartSearch] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const { results: aiResults, interpretation: aiInterpretation, loading: aiLoading, search: performAiSearch, clear: clearAiSearch } = useAiSearch();
    const debounceRef = useRef(null);

    useEffect(() => {
        if (smartSearch) return; // Don't run normal search if AI mode is on
        const params = {};
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params[key] = val;
        });
        fetchAllProducts(params);
    }, [filters, smartSearch]);

    const handleFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({ category: '', size: '', condition: '', minPrice: '', maxPrice: '', search: '', sort: '' });
        setSearchParams({});
    };

    // AI Search with debounce
    const handleAiSearch = useCallback(async (query) => {
        if (!query || query.trim().length < 3) {
            clearAiSearch();
            return;
        }

        await performAiSearch(query);
    }, [performAiSearch, clearAiSearch]);

    const handleAiInputChange = (e) => {
        const val = e.target.value;
        setAiQuery(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => handleAiSearch(val), 800);
    };

    const handleAiKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            handleAiSearch(aiQuery);
        }
    };

    const toggleSmartSearch = () => {
        setSmartSearch(!smartSearch);
        setAiQuery('');
        setAiResults(null);
        setAiInterpretation('');
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    // Decide which products to show
    const displayProducts = smartSearch ? (aiResults || []) : products;
    const filteredProducts = displayProducts.filter((product) => {
        const sellerId = product.seller?._id || product.seller?.id || product.seller;
        const isOwnProduct = user && sellerId && (sellerId === user.id || sellerId === user._id);
        return !isOwnProduct;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Search Bar */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={toggleSmartSearch}
                        className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-4 py-2 border rounded-full transition-all cursor-pointer ${
                            smartSearch
                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-violet-500 text-white shadow-lg shadow-violet-900/30'
                                : 'border-neutral-700 text-neutral-500 hover:border-neutral-500'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                        {smartSearch ? 'AI Search Active' : 'Smart Search'}
                    </button>
                    {smartSearch && (
                        <span className="text-[10px] text-violet-400/70 italic">
                            Try: "college ke liye casual outfit" or "date night dress"
                        </span>
                    )}
                </div>

                <div className="relative max-w-xl">
                    {smartSearch ? (
                        <>
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Describe what you're looking for... (e.g., gym ke liye kapde)"
                                value={aiQuery}
                                onChange={handleAiInputChange}
                                onKeyDown={handleAiKeyDown}
                                className="w-full bg-[#141414] border border-violet-800/50 pl-11 pr-4 py-3 text-sm text-white placeholder-violet-300/30 outline-none focus:border-violet-600 transition-colors rounded-lg"
                                autoFocus
                            />
                            {aiLoading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={(e) => handleFilter('search', e.target.value)}
                                className="w-full bg-[#141414] border border-neutral-800 pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-600 transition-colors"
                            />
                        </>
                    )}
                </div>

                {/* AI Interpretation Chip */}
                {smartSearch && aiInterpretation && !aiLoading && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-violet-950/50 border border-violet-800/30 text-violet-300 text-[11px] px-3 py-1.5 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                            </svg>
                            {aiInterpretation}
                        </span>
                        <span className="text-[10px] text-neutral-600">
                            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex gap-8">
                {/* Sidebar Filters — hidden in AI mode */}
                {!smartSearch && (
                    <aside className="hidden md:block w-56 shrink-0 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Filters</h3>
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters}
                                    className="text-[10px] text-neutral-500 hover:text-white transition-colors cursor-pointer">
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">Category</p>
                            {['Tops', 'Bottoms', 'Footwear', 'Accessories'].map((cat) => (
                                <button key={cat} onClick={() => handleFilter('category', filters.category === cat ? '' : cat)}
                                    className={`block w-full text-left text-xs py-1.5 transition-colors cursor-pointer ${
                                        filters.category === cat ? 'text-white font-semibold' : 'text-neutral-500 hover:text-neutral-300'
                                    }`}>
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Size */}
                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                                    <button key={s} onClick={() => handleFilter('size', filters.size === s ? '' : s)}
                                        className={`text-[10px] font-bold px-3 py-1.5 border transition-colors cursor-pointer ${
                                            filters.size === s
                                                ? 'bg-white text-black border-white'
                                                : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                                        }`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Condition */}
                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">Condition</p>
                            {['New', 'Like New', 'Good', 'Fair'].map((c) => (
                                <button key={c} onClick={() => handleFilter('condition', filters.condition === c ? '' : c)}
                                    className={`block w-full text-left text-xs py-1.5 transition-colors cursor-pointer ${
                                        filters.condition === c ? 'text-white font-semibold' : 'text-neutral-500 hover:text-neutral-300'
                                    }`}>
                                    {c}
                                </button>
                            ))}
                        </div>

                        {/* Price */}
                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">Price Range</p>
                            <div className="flex gap-2">
                                <input type="number" placeholder="Min" value={filters.minPrice}
                                    onChange={(e) => handleFilter('minPrice', e.target.value)}
                                    className="w-full bg-[#1c1c1c] border border-neutral-700 px-2 py-1.5 text-xs text-white outline-none" />
                                <input type="number" placeholder="Max" value={filters.maxPrice}
                                    onChange={(e) => handleFilter('maxPrice', e.target.value)}
                                    className="w-full bg-[#1c1c1c] border border-neutral-700 px-2 py-1.5 text-xs text-white outline-none" />
                            </div>
                        </div>
                    </aside>
                )}

                {/* Products Grid */}
                <div className="flex-1">
                    {/* Sort bar */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-xs text-neutral-500">
                            {(smartSearch ? aiLoading : loading) ? '...' : `${filteredProducts.length} products`}
                        </p>
                        {!smartSearch && (
                            <select value={filters.sort} onChange={(e) => handleFilter('sort', e.target.value)}
                                className="bg-[#141414] border border-neutral-700 text-xs text-neutral-400 px-3 py-2 outline-none cursor-pointer">
                                <option value="">Newest</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                            </select>
                        )}
                    </div>

                    {(smartSearch ? aiLoading : loading) ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-[#141414] border border-neutral-800 animate-pulse">
                                    <div className="aspect-[3/4] bg-neutral-800" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-3 bg-neutral-800 rounded w-1/2" />
                                        <div className="h-4 bg-neutral-800 rounded w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-neutral-500 text-sm">
                                {smartSearch ? 'No products match your search. Try a different description!' : 'No products found'}
                            </p>
                            {smartSearch ? (
                                <button onClick={toggleSmartSearch}
                                    className="text-violet-400 text-xs underline mt-2 cursor-pointer">
                                    Switch to regular search
                                </button>
                            ) : activeFilterCount > 0 && (
                                <button onClick={clearFilters}
                                    className="text-white text-xs underline mt-2 cursor-pointer">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Browse;
