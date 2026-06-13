import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../features/auth/hooks/useAuth';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const { items } = useSelector((state) => state.cart);
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleLogout = async () => {
        await logoutUser();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="font-serif text-xl tracking-[0.4em] text-white uppercase hover:text-neutral-300 transition-colors">
                        SNITCH
                    </Link>

                    {/* Center Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/browse" className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 hover:text-white uppercase transition-colors">
                            Browse
                        </Link>
                        {user?.isSeller && (
                            <Link to="/dashboard" className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 hover:text-white uppercase transition-colors">
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {/* Cart */}
                                <Link to="/cart" className="relative text-neutral-400 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Profile dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuOpen(!menuOpen)}
                                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                                            {user.fullName?.charAt(0)}
                                        </div>
                                    </button>

                                    {menuOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-[#1a1a1a] border border-neutral-800 shadow-2xl py-2 z-50">
                                            <div className="px-4 py-2 border-b border-neutral-800">
                                                <p className="text-xs text-white font-semibold truncate">{user.fullName}</p>
                                                <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                                            </div>

                                            <Link to="/orders" onClick={() => setMenuOpen(false)}
                                                className="block px-4 py-2.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                                                My Orders
                                            </Link>

                                            <Link to="/my-offers" onClick={() => setMenuOpen(false)}
                                                className="block px-4 py-2.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                                                My Offers
                                            </Link>

                                            {!user.isSeller && (
                                                <Link to="/become-seller" onClick={() => setMenuOpen(false)}
                                                    className="block px-4 py-2.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                                                    🛍️ Become a Seller
                                                </Link>
                                            )}

                                            {user.isSeller && (
                                                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                                                    className="block px-4 py-2.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                                                    📊 Seller Dashboard
                                                </Link>
                                            )}

                                            {!user.hasPassword && (
                                                <Link to="/set-password" onClick={() => setMenuOpen(false)}
                                                    className="block px-4 py-2.5 text-xs text-yellow-500 hover:text-yellow-400 hover:bg-neutral-800 transition-colors">
                                                    🔑 Set Password
                                                </Link>
                                            )}

                                            <div className="border-t border-neutral-800 mt-1">
                                                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-neutral-800 transition-colors cursor-pointer">
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login"
                                    className="text-[11px] font-semibold tracking-[0.15em] text-neutral-400 hover:text-white uppercase transition-colors">
                                    Login
                                </Link>
                                <Link to="/register"
                                    className="bg-white text-black text-[11px] font-bold tracking-[0.15em] px-5 py-2 hover:bg-neutral-200 transition-colors uppercase">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
