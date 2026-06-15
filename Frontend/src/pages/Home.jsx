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
        <div className="min-h-screen bg-[#070707] text-white overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-center bg-radial-[at_center_center] from-violet-950/20 via-[#070707] to-[#070707] py-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-900/60">
                {/* Glowing decorative ambient spots */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[12000ms]" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />

                <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/40 border border-violet-800/20 backdrop-blur-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                        <span className="text-[9px] font-bold tracking-[0.3em] text-violet-300 uppercase">
                            Premium Streetwear Marketplace
                        </span>
                    </div>

                    <h1 className="font-serif text-5xl sm:text-7xl lg:text-9xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-500 uppercase leading-[1.15] font-extrabold select-none filter drop-shadow-sm">
                        SNITCH
                    </h1>

                    <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
                        Buy, sell, and bid on authentic high-end streetwear. Enter live FCFS drops or negotiate with sellers via interactive royalty-backed offers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/browse"
                            className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black text-[11px] font-bold tracking-[0.25em] px-10 py-4 transition-all duration-350 uppercase rounded-xl shadow-lg shadow-white/5 border border-white">
                            Explore Marketplace
                        </Link>
                        <Link to="/drops"
                            className="w-full sm:w-auto bg-neutral-950/70 hover:bg-neutral-900/80 text-violet-400 border border-neutral-800/80 hover:border-violet-800/40 text-[11px] font-bold tracking-[0.25em] px-10 py-4 transition-all duration-350 uppercase rounded-xl backdrop-blur-md">
                            ⚡ Live Releases
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features section (Value Prop) */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-neutral-950/40 border border-neutral-900/70 p-8 rounded-2xl backdrop-blur-sm space-y-4 hover:border-neutral-800 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-violet-950/50 border border-violet-800/30 flex items-center justify-center text-lg">
                            ⚡
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Live Drops & FCFS</h3>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            Never miss a release. Strict 1-unit-per-transaction limit ensures fair access to high-demand items.
                        </p>
                    </div>

                    <div className="bg-neutral-950/40 border border-neutral-900/70 p-8 rounded-2xl backdrop-blur-sm space-y-4 hover:border-neutral-800 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-violet-950/50 border border-violet-800/30 flex items-center justify-center text-lg">
                            🤝
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Royalty-Backed Resale</h3>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            Resell products instantly. Original sellers earn a 5% royalty fee automatically when a item gets re-snitched.
                        </p>
                    </div>

                    <div className="bg-neutral-950/40 border border-neutral-900/70 p-8 rounded-2xl backdrop-blur-sm space-y-4 hover:border-neutral-800 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-violet-950/50 border border-violet-800/30 flex items-center justify-center text-lg">
                            💼
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Wallet Settlements</h3>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            Secure, real-time balance settlements. Sellers can cash out directly or use funds for seamless purchasing.
                        </p>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="text-center space-y-2 mb-12">
                    <h2 className="text-[10px] font-bold tracking-[0.4em] text-neutral-500 uppercase">
                        Curated Collections
                    </h2>
                    <p className="text-xs text-neutral-400">Shop premium essentials across verified categories</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { name: 'Tops', count: 'Jackets & Tees', gradient: 'from-violet-950/40 to-neutral-950' },
                        { name: 'Bottoms', count: 'Cargoes & Denim', gradient: 'from-fuchsia-950/40 to-neutral-950' },
                        { name: 'Footwear', count: 'Sneakers & Slides', gradient: 'from-indigo-950/40 to-neutral-950' },
                        { name: 'Accessories', count: 'Bags & Eyewear', gradient: 'from-emerald-950/40 to-neutral-950' }
                    ].map((cat) => (
                        <Link key={cat.name} to={`/browse?category=${cat.name}`}
                            className={`group relative overflow-hidden bg-gradient-to-br ${cat.gradient} border border-neutral-900 p-8 rounded-2xl hover:border-neutral-700/80 transition-all duration-300`}>
                            <div className="relative z-10">
                                <p className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">{cat.name}</p>
                                <p className="text-[9px] text-neutral-500 mt-1 tracking-wider uppercase font-semibold">{cat.count}</p>
                            </div>
                            <div className="absolute right-4 bottom-4 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">
                                →
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Latest Products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-end justify-between mb-10 border-b border-neutral-900 pb-4">
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-bold tracking-[0.4em] text-neutral-500 uppercase">
                            Recent Drops
                        </h2>
                        <p className="text-xs text-neutral-400">Newly listed authentic fashion pieces</p>
                    </div>
                    <Link to="/browse" className="text-[10px] font-bold tracking-[0.2em] text-violet-400 hover:text-white uppercase transition-colors">
                        View Marketplace →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[#141414]/30 border border-neutral-900 rounded-2xl animate-pulse overflow-hidden">
                                <div className="aspect-square bg-neutral-900" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-neutral-900 rounded w-1/2" />
                                    <div className="h-4 bg-neutral-900 rounded w-3/4" />
                                    <div className="h-4 bg-neutral-900 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {products.slice(0, 8).map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-neutral-950/20 border border-neutral-900/60 rounded-2xl">
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">No products available currently</p>
                        {user && !user.isSeller && (
                            <Link to="/become-seller" className="text-violet-400 text-xs font-bold uppercase tracking-wider mt-4 inline-block hover:underline">
                                Start Selling Yours →
                            </Link>
                        )}
                    </div>
                )}
            </section>

            {/* Call To Action Banner */}
            {!user?.isSeller && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-950/40 via-fuchsia-950/20 to-neutral-950 border border-violet-900/20 p-12 text-center space-y-6">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />
                        <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-widest text-white">
                            Turn your closet into capital
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
                            Become a verified SNITCH seller today. Sell deadstock or pre-loved pieces, get secure payouts, and earn lifetime royalties on resale.
                        </p>
                        <div className="pt-2">
                            <Link to={user ? "/become-seller" : "/login"}
                                className="inline-block bg-white hover:bg-neutral-200 text-black text-[11px] font-bold tracking-[0.2em] px-8 py-3.5 rounded-xl uppercase transition-all">
                                Join as Seller
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
