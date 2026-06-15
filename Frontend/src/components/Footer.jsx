import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#080808] border-t border-neutral-900 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand Column */}
                <div className="space-y-4">
                    <Link to="/" className="font-serif text-xl tracking-[0.4em] text-white uppercase hover:text-neutral-300 transition-colors">
                        SNITCH
                    </Link>
                    <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                        Join the elite marketplace. Discover authentic high-end streetwear, active drops, and exclusive community releases.
                    </p>
                </div>

                {/* Navigation Column */}
                <div>
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase mb-4">Explore</h4>
                    <ul className="space-y-2.5">
                        <li>
                            <Link to="/browse" className="text-xs text-neutral-500 hover:text-white transition-colors">
                                Browse Marketplace
                            </Link>
                        </li>
                        <li>
                            <Link to="/drops" className="text-xs text-neutral-500 hover:text-white transition-colors">
                                Live Drops
                            </Link>
                        </li>
                        <li>
                            <Link to="/orders" className="text-xs text-neutral-500 hover:text-white transition-colors">
                                Track Orders
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Seller Column */}
                <div>
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase mb-4">Sell</h4>
                    <ul className="space-y-2.5">
                        <li>
                            <Link to="/become-seller" className="text-xs text-neutral-500 hover:text-white transition-colors">
                                Become a Seller
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard" className="text-xs text-neutral-500 hover:text-white transition-colors">
                                Seller Dashboard
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Newsletter / Security Column */}
                <div>
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase mb-4">Secured checkout</h4>
                    <div className="flex items-center gap-2 mb-4 p-3 bg-neutral-950/65 border border-neutral-900 rounded-xl">
                        <svg className="w-4 h-4 text-violet-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                        <span className="text-[10px] text-neutral-400 font-semibold">Protected by Razorpay</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-neutral-900 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-[10px] text-neutral-600 font-semibold tracking-wider uppercase">
                    &copy; {currentYear} SNITCH Inc. All Rights Reserved.
                </p>
                <div className="flex gap-6 text-[10px] uppercase font-bold tracking-wider">
                    <span className="text-neutral-600 hover:text-neutral-400 cursor-pointer transition-colors">Privacy Policy</span>
                    <span className="text-neutral-600 hover:text-neutral-400 cursor-pointer transition-colors">Terms of Service</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
