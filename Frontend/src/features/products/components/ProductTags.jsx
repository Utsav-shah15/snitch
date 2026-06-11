import React from 'react';

/**
 * ProductTags — Displays size, condition, and stock badges for a product.
 *
 * @param {{ size: string, condition: string, stock: number }} props
 */
const ProductTags = ({ size, condition, stock }) => {
    return (
        <div className="flex flex-wrap gap-2">
            <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                Size: {size}
            </span>
            <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                {condition}
            </span>
            <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                {stock > 0 ? `${stock} in stock` : 'Sold Out'}
            </span>
        </div>
    );
};

export default ProductTags;
