import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

const BecomeSeller = () => {
    const { user } = useSelector((state) => state.auth);
    const { becomeSeller } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ shopName: '', bio: '' });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!user) return <Navigate to="/login" replace />;
    if (user.isSeller) return <Navigate to="/dashboard" replace />;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        setSubmitError('');
    };

    const validate = () => {
        const errs = {};
        if (!formData.shopName.trim() || formData.shopName.trim().length < 3) {
            errs.shopName = 'Shop name must be at least 3 characters';
        }
        if (formData.shopName.trim().length > 50) {
            errs.shopName = 'Shop name cannot exceed 50 characters';
        }
        if (formData.bio.length > 300) {
            errs.bio = 'Bio cannot exceed 300 characters';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await becomeSeller(formData.shopName.trim(), formData.bio.trim());
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setSubmitError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 bg-[#141414] font-sans text-white">

            <div className="w-full max-w-[480px] bg-[#1a1a1a] border border-neutral-800 px-8 py-10 shadow-2xl">

                {/* Success overlay */}
                {success && (
                    <div className="absolute inset-0 bg-[#141414] z-50 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h2 className="font-serif text-3xl tracking-widest uppercase mb-2">You're a Seller!</h2>
                        <p className="text-neutral-400 text-xs tracking-widest uppercase animate-pulse mt-2">
                            Redirecting to dashboard...
                        </p>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl tracking-[0.3em] font-normal uppercase">
                        S N I T C H
                    </h1>
                    <p className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase mt-2">
                        Set Up Your Seller Profile
                    </p>
                    <div className="h-[1px] w-12 bg-neutral-700 mx-auto mt-4" />
                </div>

                {/* Info banner */}
                <div className="bg-neutral-900 border border-neutral-700 p-4 mb-6 text-xs text-neutral-300 leading-relaxed">
                    <p>👋 Hey <span className="text-white font-bold">{user.fullName}</span>!</p>
                    <p className="mt-1 text-neutral-400">
                        You'll be able to list products, manage orders, and access your seller dashboard after this.
                    </p>
                </div>

                {/* Error */}
                {submitError && (
                    <div className="bg-red-950/50 border border-red-900/50 p-3 text-xs text-red-400 mb-5">
                        <p className="font-bold">Error</p>
                        <p className="mt-0.5">{submitError}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Shop Name */}
                    <div>
                        <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-2 uppercase">
                            Shop Name *
                        </label>
                        <input
                            type="text"
                            name="shopName"
                            value={formData.shopName}
                            onChange={handleChange}
                            placeholder="e.g. Rahul's Streetwear"
                            maxLength={50}
                            className={`w-full bg-[#252525] border px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none ${errors.shopName ? 'border-red-800' : 'border-neutral-700 focus:border-neutral-500'
                                } transition-colors`}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.shopName
                                ? <p className="text-[11px] text-red-500">{errors.shopName}</p>
                                : <span />
                            }
                            <p className="text-[10px] text-neutral-600">{formData.shopName.length}/50</p>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-2 uppercase">
                            Bio <span className="text-neutral-600 normal-case">(optional)</span>
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell buyers about your style and what you sell..."
                            maxLength={300}
                            rows={3}
                            className={`w-full bg-[#252525] border px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none resize-none ${errors.bio ? 'border-red-800' : 'border-neutral-700 focus:border-neutral-500'
                                } transition-colors`}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.bio
                                ? <p className="text-[11px] text-red-500">{errors.bio}</p>
                                : <span />
                            }
                            <p className="text-[10px] text-neutral-600">{formData.bio.length}/300</p>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-bold text-xs tracking-[0.2em] py-4 hover:bg-neutral-200 transition-all duration-300 uppercase flex items-center justify-center gap-2 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed mt-4"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Setting Up...</span>
                            </>
                        ) : (
                            'Become a Seller'
                        )}
                    </button>
                </form>

                {/* Back */}
                <div className="text-center text-xs text-neutral-500 mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="hover:text-white transition-colors"
                    >
                        ← Go back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BecomeSeller;
