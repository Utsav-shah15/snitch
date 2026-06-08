import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProductById } from '../features/products/services/product.service';
import { addToCart } from '../features/cart/cartSlice';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getProductById(id);
                setProduct(data.product);
            } catch { navigate('/browse'); } finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const handleAddToCart = () => {
        if (!user) return navigate('/login');
        dispatch(addToCart(product));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="aspect-square bg-neutral-800 animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-6 bg-neutral-800 rounded w-1/2 animate-pulse" />
                        <div className="h-8 bg-neutral-800 rounded w-1/3 animate-pulse" />
                        <div className="h-20 bg-neutral-800 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] text-neutral-500 mb-6 uppercase tracking-wider">
                <button onClick={() => navigate('/browse')} className="hover:text-white transition-colors cursor-pointer">Browse</button>
                <span>/</span>
                <span className="text-neutral-400">{product.category}</span>
                <span>/</span>
                <span className="text-white">{product.title}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Images */}
                <div>
                    <div className="aspect-square bg-neutral-900 border border-neutral-800 overflow-hidden mb-3">
                        {product.images?.[selectedImage]?.url ? (
                            <img src={product.images[selectedImage].url} alt={product.title}
                                className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                No Image
                            </div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {product.images?.length > 1 && (
                        <div className="flex gap-2">
                            {product.images.map((img, i) => (
                                <button key={i} onClick={() => setSelectedImage(i)}
                                    className={`w-16 h-16 border overflow-hidden cursor-pointer ${
                                        selectedImage === i ? 'border-white' : 'border-neutral-700 hover:border-neutral-500'
                                    } transition-colors`}>
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">{product.category}</p>
                    <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>
                    <p className="text-3xl font-bold text-white mb-6">
                        {product.price?.currency === 'INR' ? '₹' : '$'}{product.price?.amount?.toLocaleString()}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                            Size: {product.size}
                        </span>
                        <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                            {product.condition}
                        </span>
                        <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                            {product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2">Description</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>

                    {/* Add to Cart */}
                    {product.stock > 0 ? (
                        <button onClick={handleAddToCart}
                            className={`w-full py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                                added
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-black hover:bg-neutral-200'
                            }`}>
                            {added ? '✓ Added to Cart' : 'Add to Cart'}
                        </button>
                    ) : (
                        <button disabled className="w-full bg-neutral-800 text-neutral-500 py-4 text-xs font-bold tracking-[0.2em] uppercase cursor-not-allowed">
                            Sold Out
                        </button>
                    )}

                    {/* Seller Info */}
                    {product.seller && (
                        <div className="mt-8 bg-[#141414] border border-neutral-800 p-4">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Sold by</p>
                            <p className="text-sm font-semibold text-white">
                                {product.seller.sellerProfile?.shopName || product.seller.fullName}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
