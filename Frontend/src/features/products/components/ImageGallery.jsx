import React from 'react';

/**
 * ImageGallery — Displays a main image with thumbnail selectors.
 * Used on the ProductDetail page.
 *
 * @param {{ images: Array<{ url: string }>, selectedIndex: number, onSelect: (i: number) => void }} props
 */
const ImageGallery = ({ images = [], selectedIndex = 0, onSelect }) => {
    return (
        <div>
            {/* Main image */}
            <div className="aspect-square bg-neutral-900 border border-neutral-800 overflow-hidden mb-3">
                {images[selectedIndex]?.url ? (
                    <img
                        src={images[selectedIndex].url}
                        alt="Product"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                        No Image
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => onSelect(i)}
                            className={`w-16 h-16 border overflow-hidden cursor-pointer ${
                                selectedIndex === i
                                    ? 'border-white'
                                    : 'border-neutral-700 hover:border-neutral-500'
                            } transition-colors`}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
