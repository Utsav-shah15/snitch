import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useOutfitSuggestions from '../../ai/hooks/useOutfitSuggestions';

const OutfitSuggestions = ({ productId }) => {
    const { suggestions, loading, error, fetchSuggestions } = useOutfitSuggestions();

    useEffect(() => {
        if (productId) {
            fetchSuggestions(productId);
        }
    }, [productId, fetchSuggestions]);

    if (loading) {
        return (
            <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-4 h-4 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
                    <span className="text-[10px] text-violet-400/60 uppercase tracking-widest font-bold">AI is styling your look...</span>
                </div>
                <div className="flex gap-3 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-36 shrink-0 bg-[#141414] border border-neutral-800 animate-pulse">
                            <div className="aspect-[3/4] bg-neutral-800" />
                            <div className="p-2 space-y-1.5">
                                <div className="h-2.5 bg-neutral-800 rounded w-3/4" />
                                <div className="h-3 bg-neutral-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || suggestions.length === 0) return null;

    return (
        <div className="mt-12">
            <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                <h2 className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">Complete This Look</h2>
            </div>
            <p className="text-[10px] text-neutral-600 mb-6">AI-powered styling suggestions</p>

            {suggestions.map((section, idx) => (
                <div key={idx} className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-white">{section.label}</h3>
                        {section.styleTip && (
                            <span className="text-[10px] text-violet-400/70 italic hidden sm:inline">
                                💡 {section.styleTip}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {section.products.map((product) => (
                            <Link
                                key={product._id}
                                to={`/product/${product._id}`}
                                className="w-36 shrink-0 bg-[#141414] border border-neutral-800 hover:border-neutral-600 transition-colors group"
                            >
                                <div className="aspect-[3/4] bg-neutral-900 overflow-hidden">
                                    {product.images?.[0]?.url ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-700 text-[10px]">No image</div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-[10px] text-neutral-400 truncate">{product.title}</p>
                                    <p className="text-xs font-bold text-white mt-0.5">
                                        ₹{product.price?.amount?.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OutfitSuggestions;
