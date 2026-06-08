import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const { _id, title, images, price, category, size, condition, seller } = product;

    return (
        <Link to={`/product/${_id}`} className="group block">
            <div className="bg-[#141414] border border-neutral-800 overflow-hidden hover:border-neutral-600 transition-all duration-300">
                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden bg-neutral-900 relative">
                    {images?.[0]?.url ? (
                        <img
                            src={images[0].url}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                            </svg>
                        </div>
                    )}

                    {/* Condition badge */}
                    <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[9px] font-bold tracking-wider text-white px-2 py-1 uppercase">
                        {condition}
                    </span>
                </div>

                {/* Info */}
                <div className="p-3">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">{category} · {size}</p>
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-neutral-300 transition-colors">
                        {title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-bold text-white">
                            {price?.currency === 'INR' ? '₹' : '$'}{price?.amount?.toLocaleString()}
                        </p>
                        {seller?.sellerProfile?.shopName && (
                            <p className="text-[10px] text-neutral-500 truncate max-w-[100px]">
                                {seller.sellerProfile.shopName}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
