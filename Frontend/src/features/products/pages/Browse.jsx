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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-white">
            {/* Header Title Area */}
            <div className="mb-10 space-y-2">
                <h1 className="font-serif text-3xl tracking-widest uppercase">Marketplace</h1>
                <p className="text-xs text-neutral-500 font-medium">Explore premium pre-loved and deadstock releases from verified members</p>
            </div>

            {/* Search Bar section */}
            <div className="mb-10 bg-neutral-950/45 border border-neutral-900 p-6 rounded-2xl backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        {smartSearch ? (
                            <>
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Describe what you're looking for... (e.g., college ke liye casual clothes)"
                                    value={aiQuery}
                                    onChange={handleAiInputChange}
                                    onKeyDown={handleAiKeyDown}
                                    className="w-full bg-[#111111] border border-violet-800/40 pl-12 pr-4 py-3.5 text-xs text-white placeholder-violet-400/20 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/35 transition-all rounded-xl"
                                    autoFocus
                                />
                                {aiLoading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-violet-600/25 border-t-violet-400 rounded-full animate-spin" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search product name, brands..."
                                    value={filters.search}
                                    onChange={(e) => handleFilter('search', e.target.value)}
                                    className="w-full bg-[#111111] border border-neutral-900 pl-12 pr-4 py-3.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-neutral-700 transition-all rounded-xl"
                                />
                            </>
                        )}
                    </div>

                    <button
                        onClick={toggleSmartSearch}
                        className={`flex items-center justify-center gap-2 text-[10px] font-extrabold tracking-widest uppercase px-6 py-3.5 border rounded-xl transition-all cursor-pointer ${
                            smartSearch
                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-violet-500 text-white shadow-lg shadow-violet-950/40'
                                : 'border-neutral-800 bg-[#111111] text-neutral-400 hover:border-neutral-700 hover:text-white'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                        {smartSearch ? 'AI SEARCH ON' : 'AI SMART SEARCH'}
                    </button>
                </div>

                {/* AI Helper Text */}
                {smartSearch && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-neutral-900 pt-4">
                        {aiInterpretation && !aiLoading ? (
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 bg-violet-950/40 border border-violet-800/30 text-violet-300 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg">
                                    💡 {aiInterpretation}
                                </span>
                            </div>
                        ) : (
                            <span className="text-[10px] text-neutral-500 italic">
                                Try describing the context, fit, or look: "red color varsity jacket" or "sports shoes"
                            </span>
                        )}
                        <span className="text-[10px] text-neutral-500 font-bold">
                            {filteredProducts.length} items found
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters — hidden in AI mode */}
                {!smartSearch ? (
                    <aside className="w-full md:w-60 shrink-0 space-y-6 bg-neutral-950/30 border border-neutral-900 p-6 rounded-2xl h-fit md:sticky md:top-24">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                            <h3 className="text-[10px] font-extrabold tracking-widest text-neutral-400 uppercase">Filters</h3>
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters}
                                    className="text-[10px] text-violet-400 hover:text-white font-bold transition-colors cursor-pointer">
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Category */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-extrabold tracking-wider text-neutral-500 uppercase">Category</p>
                            <div className="space-y-1.5">
                                {['Tops', 'Bottoms', 'Footwear', 'Accessories'].map((cat) => (
                                    <button key={cat} onClick={() => handleFilter('category', filters.category === cat ? '' : cat)}
                                        className={`flex items-center justify-between w-full text-left text-xs py-2 px-3 rounded-lg transition-all cursor-pointer ${
                                            filters.category === cat
                                                ? 'bg-neutral-900 text-white font-bold border border-neutral-800'
                                                : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
                                        }`}>
                                        <span>{cat}</span>
                                        {filters.category === cat && <span className="text-violet-400 text-[9px]">●</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-extrabold tracking-wider text-neutral-500 uppercase">Size</p>
                            <div className="grid grid-cols-3 gap-2">
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                                    <button key={s} onClick={() => handleFilter('size', filters.size === s ? '' : s)}
                                        className={`text-[10px] font-extrabold py-2 border rounded-lg transition-all cursor-pointer text-center ${
                                            filters.size === s
                                                ? 'bg-white text-black border-white'
                                                : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 bg-neutral-950/20'
                                        }`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Condition */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-extrabold tracking-wider text-neutral-500 uppercase">Condition</p>
                            <div className="space-y-1.5">
                                {['New', 'Like New', 'Good', 'Fair'].map((c) => (
                                    <button key={c} onClick={() => handleFilter('condition', filters.condition === c ? '' : c)}
                                        className={`flex items-center justify-between w-full text-left text-xs py-2 px-3 rounded-lg transition-all cursor-pointer ${
                                            filters.condition === c
                                                ? 'bg-neutral-900 text-white font-bold border border-neutral-800'
                                                : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
                                        }`}>
                                        <span>{c}</span>
                                        {filters.condition === c && <span className="text-violet-400 text-[9px]">●</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-extrabold tracking-wider text-neutral-500 uppercase">Price Range</p>
                            <div className="flex gap-2">
                                <input type="number" placeholder="Min" value={filters.minPrice}
                                    onChange={(e) => handleFilter('minPrice', e.target.value)}
                                    className="w-full bg-[#111111] border border-neutral-900 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-700 outline-none focus:border-neutral-800" />
                                <input type="number" placeholder="Max" value={filters.maxPrice}
                                    onChange={(e) => handleFilter('maxPrice', e.target.value)}
                                    className="w-full bg-[#111111] border border-neutral-900 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-700 outline-none focus:border-neutral-800" />
                            </div>
                        </div>
                    </aside>
                ) : null}

                {/* Products Grid */}
                <div className="flex-1">
                    {/* Sort and meta bar */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-xs text-neutral-500 font-medium">
                            {(smartSearch ? aiLoading : loading) ? 'Searching listings...' : `${filteredProducts.length} items listed`}
                        </p>
                        {!smartSearch && (
                            <select value={filters.sort} onChange={(e) => handleFilter('sort', e.target.value)}
                                className="bg-neutral-950/45 border border-neutral-900 text-xs text-neutral-400 px-4 py-2 rounded-xl outline-none cursor-pointer hover:border-neutral-700 transition-colors">
                                <option value="">Newest Listings</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        )}
                    </div>

                    {(smartSearch ? aiLoading : loading) ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-[#141414]/20 border border-neutral-900 rounded-2xl animate-pulse overflow-hidden">
                                    <div className="aspect-square bg-neutral-900" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-3 bg-neutral-900 rounded w-1/2" />
                                        <div className="h-4 bg-neutral-900 rounded w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-neutral-950/10 border border-neutral-900/60 rounded-2xl">
                            <p className="text-neutral-500 text-xs uppercase font-extrabold tracking-wider">
                                {smartSearch ? 'No matched listings. Try different tags or description!' : 'No products match these filters'}
                            </p>
                            {smartSearch ? (
                                <button onClick={toggleSmartSearch}
                                    className="text-violet-400 text-xs font-bold uppercase tracking-wider mt-4 hover:underline cursor-pointer">
                                    Switch to regular search
                                </button>
                            ) : activeFilterCount > 0 && (
                                <button onClick={clearFilters}
                                    className="text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider mt-4 hover:underline cursor-pointer">
                                    Clear all filters
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
