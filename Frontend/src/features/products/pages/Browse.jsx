import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';

const Browse = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, loading, fetchAllProducts } = useProducts();

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

    useEffect(() => {
        const params = {};
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params[key] = val;
        });
        fetchAllProducts(params);
    }, [filters]);

    const handleFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({ category: '', size: '', condition: '', minPrice: '', maxPrice: '', search: '', sort: '' });
        setSearchParams({});
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-xl">
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
                </div>
            </div>

            <div className="flex gap-8">
                {/* Sidebar Filters */}
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

                {/* Products Grid */}
                <div className="flex-1">
                    {/* Sort bar */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-xs text-neutral-500">
                            {loading ? '...' : `${products.length} products`}
                        </p>
                        <select value={filters.sort} onChange={(e) => handleFilter('sort', e.target.value)}
                            className="bg-[#141414] border border-neutral-700 text-xs text-neutral-400 px-3 py-2 outline-none cursor-pointer">
                            <option value="">Newest</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                        </select>
                    </div>

                    {loading ? (
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
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-neutral-500 text-sm">No products found</p>
                            {activeFilterCount > 0 && (
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
