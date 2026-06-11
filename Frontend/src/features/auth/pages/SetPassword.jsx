import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

const SetPassword = () => {
    const { user } = useSelector((state) => state.auth);
    const { setPassword } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!user) return <Navigate to="/login" replace />;

    // If they already have a password set, they don't need this page
    if (user.hasPassword && !success) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-6">
                <div className="max-w-md w-full text-center space-y-6 bg-[#141414] border border-neutral-900 p-8 rounded-none shadow-2xl">
                    <h2 className="font-serif text-2xl tracking-[0.2em] uppercase">Password Already Set</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                        Your account already has a password. You can manage your account settings or head back to the home page.
                    </p>
                    <Link to="/" className="inline-block bg-white text-black text-[11px] font-bold tracking-[0.2em] px-8 py-3.5 hover:bg-neutral-200 transition-all uppercase">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        setSubmitError('');
    };

    const validate = () => {
        const errs = {};
        if (!formData.password) {
            errs.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errs.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            errs.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            await setPassword(formData.password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            setSubmitError(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-6">
                <div className="max-w-md w-full text-center space-y-6 bg-[#141414] border border-neutral-900 p-8 shadow-2xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2 className="font-serif text-3xl tracking-widest uppercase mb-2">Password Set!</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                        Your account password has been successfully configured.
                    </p>
                    <p className="text-neutral-500 text-[10px] tracking-widest uppercase animate-pulse">
                        Redirecting you home...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-6">
            <div className="max-w-md w-full space-y-8 bg-[#141414] border border-neutral-900 p-8 shadow-2xl">
                <div className="text-center">
                    <h2 className="font-serif text-3xl tracking-[0.2em] uppercase mb-2">Set Password</h2>
                    <p className="text-neutral-400 text-xs tracking-wider uppercase">
                        Configure a password for secure email login
                    </p>
                </div>

                {submitError && (
                    <div className="bg-red-950/40 border border-red-900/50 p-4 text-xs text-red-400">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Password */}
                    <div className="relative">
                        <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 8 characters"
                                className={`w-full bg-[#1c1c1c] border px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none ${
                                    errors.password ? 'border-red-800' : 'border-neutral-700 focus:border-neutral-500'
                                } transition-colors pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                            >
                                {showPassword ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-1.5 uppercase">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                className={`w-full bg-[#1c1c1c] border px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none ${
                                    errors.confirmPassword ? 'border-red-800' : 'border-neutral-700 focus:border-neutral-500'
                                } transition-colors pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                            >
                                {showConfirm ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black text-xs font-bold tracking-[0.2em] py-3.5 hover:bg-neutral-200 transition-colors uppercase cursor-pointer disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Setting Password...' : 'Confirm Password'}
                    </button>
                </form>

                <div className="text-center">
                    <Link to="/" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-wider transition-colors">
                        Skip for now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SetPassword;
