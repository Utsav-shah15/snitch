import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../features/products/components/ProductCard';
import { getAllProducts } from '../features/products/services/product.service';

const Home = () => {
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAllProducts({ sort: 'newest' });
                setProducts(data.products || []);
            } catch { /* silent */ } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />

                <div className="relative text-center px-4 z-10">
                    <p className="text-[10px] font-bold tracking-[0.5em] text-neutral-500 uppercase mb-4 animate-pulse">
                        Indian Streetwear Marketplace
                    </p>
                    <h1 className="font-serif text-6xl sm:text-8xl tracking-[0.3em] text-white uppercase mb-6">
                        SNITCH
                    </h1>
                    <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                        Buy, sell, and discover exclusive streetwear. From rare finds to everyday drip.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link to="/browse"
                            className="bg-white text-black text-[11px] font-bold tracking-[0.2em] px-8 py-3.5 hover:bg-neutral-200 transition-all uppercase">
                            Shop Now
                        </Link>
                        {user && !user.isSeller && (
                            <Link to="/become-seller"
                                className="border border-neutral-600 text-white text-[11px] font-bold tracking-[0.2em] px-8 py-3.5 hover:bg-white hover:text-black transition-all uppercase">
                                Start Selling
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase mb-8 text-center">
                    Shop by Category
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Tops', 'Bottoms', 'Footwear', 'Accessories'].map((cat) => (
                        <Link key={cat} to={`/browse?category=${cat}`}
                            className="group bg-[#141414] border border-neutral-800 p-8 text-center hover:border-neutral-500 transition-all">
                            <p className="text-lg font-semibold text-white group-hover:text-neutral-300 transition-colors">{cat}</p>
                            <p className="text-[10px] text-neutral-500 mt-1 tracking-wider uppercase">View Collection →</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Latest Products */}
            <section className="max-w-7xl mx-auto px-4 pb-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase">
                        Latest Drops
                    </h2>
                    <Link to="/browse" className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 hover:text-white uppercase transition-colors">
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[#141414] border border-neutral-800 animate-pulse">
                                <div className="aspect-[3/4] bg-neutral-800" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-neutral-800 rounded w-1/2" />
                                    <div className="h-4 bg-neutral-800 rounded w-3/4" />
                                    <div className="h-4 bg-neutral-800 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {products.slice(0, 8).map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-neutral-500">
                        <p className="text-sm">No products yet. Be the first to list!</p>
                        {user && !user.isSeller && (
                            <Link to="/become-seller" className="text-white underline text-sm mt-2 inline-block">
                                Become a Seller →
                            </Link>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
