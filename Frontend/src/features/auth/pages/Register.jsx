import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { user } = useSelector((state) => state.auth);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Form states
  const [isSeller, setIsSeller] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: ''
  });
  const [agreed, setAgreed] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
    setSubmitError('');
  };

  // Form validation
  const validateForm = () => {
    const tempErrors = {};
    
    // Name validation
    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      tempErrors.fullName = 'Full name must be at least 3 characters';
    } else if (formData.fullName.trim().length > 50) {
      tempErrors.fullName = 'Full name cannot exceed 50 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    // Contact number validation (must be exactly 10 digits for backend validation)
    const contactClean = formData.contact.replace(/\D/g, ''); // strip non-digits for validation
    if (!formData.contact) {
      tempErrors.contact = 'Contact number is required';
    } else if (contactClean.length !== 10) {
      tempErrors.contact = 'Contact number must be exactly 10 digits';
    }

    // Password validation (min 8 chars, uppercase, lowercase, digit)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    } else if (!passwordRegex.test(formData.password)) {
      tempErrors.password = 'Password must contain uppercase, lowercase and a number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    // Agreement checkbox validation
    if (!agreed) {
      tempErrors.agreed = 'You must agree to the Terms & Privacy Policy';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const contactNumber = formData.contact.replace(/\D/g, '');
      
      await register(
        formData.fullName.trim(),
        formData.email.toLowerCase().trim(),
        formData.password,
        contactNumber,
        isSeller
      );
      
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 relative bg-[url('/dark_luxury_background.png')] bg-cover bg-center bg-fixed bg-no-repeat font-sans text-white">
      {/* Background Blur Overlay for premium feel */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      {/* Main Container */}
      <div className="relative w-full max-w-[450px] bg-[#141414]/90 text-white px-8 py-10 sm:px-10 sm:py-12 shadow-[0_32px_64px_rgba(0,0,0,0.8)] border border-neutral-900 transition-all duration-300">
        
        {/* Success Modal Overlay */}
        {registrationSuccess && (
          <div className="absolute inset-0 bg-[#141414] z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black mb-6 shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-serif text-3xl text-white tracking-widest uppercase mb-2">Welcome</h2>
            <p className="text-neutral-400 text-xs font-semibold tracking-widest uppercase mb-4">Account created successfully</p>
            <div className="h-[2px] w-12 bg-white my-2"></div>
            <p className="text-neutral-400 text-xs mt-4 animate-pulse">Redirecting to sign in...</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-[0.3em] font-normal text-white uppercase">
            S N I T C H
          </h1>
          <p className="font-sans text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase mt-2">
            Create your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* General Error Banner */}
          {submitError && (
            <div className="bg-red-950/50 border border-red-900/50 p-3 text-xs text-red-400 animate-slide-in">
              <p className="font-bold">Registration Failed</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-2 uppercase">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className={`w-full bg-[#1c1c1c] border transition-all duration-300 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none rounded-none ${
                  errors.fullName ? 'border-red-800 focus:border-red-600' : 'border-neutral-800 focus:border-neutral-500'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-red-500 mt-1.5 animate-fade-in">{errors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-2 uppercase">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@studio.com"
                className={`w-full bg-[#1c1c1c] border transition-all duration-300 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none rounded-none ${
                  errors.email ? 'border-red-800 focus:border-red-600' : 'border-neutral-800 focus:border-neutral-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1.5 animate-fade-in">{errors.email}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-2 uppercase">
              Contact Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+1 555 0100"
                className={`w-full bg-[#1c1c1c] border transition-all duration-300 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none rounded-none ${
                  errors.contact ? 'border-red-800 focus:border-red-600' : 'border-neutral-800 focus:border-neutral-500'
                }`}
              />
            </div>
            {errors.contact ? (
              <p className="text-[11px] text-red-500 mt-1.5 animate-fade-in">{errors.contact}</p>
            ) : (
              <p className="text-[9px] text-neutral-500 mt-1">Please provide a 10-digit contact number.</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-2 uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className={`w-full bg-[#1c1c1c] border transition-all duration-300 pl-4 pr-12 py-3 text-sm text-white placeholder-neutral-500 outline-none rounded-none ${
                  errors.password ? 'border-red-800 focus:border-red-600' : 'border-neutral-800 focus:border-neutral-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="text-[11px] text-red-500 mt-1.5 animate-fade-in">{errors.password}</p>
            ) : (
              <p className="text-[9px] text-neutral-500 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-2 uppercase">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className={`w-full bg-[#1c1c1c] border transition-all duration-300 pl-4 pr-12 py-3 text-sm text-white placeholder-neutral-500 outline-none rounded-none ${
                  errors.confirmPassword ? 'border-red-800 focus:border-red-600' : 'border-neutral-800 focus:border-neutral-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-500 mt-1.5 animate-fade-in">{errors.confirmPassword}</p>
            )}
          </div>

          {/* I AM A Switcher */}
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block mb-2 uppercase">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <button
                type="button"
                onClick={() => setIsSeller(false)}
                className={`py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border ${
                  !isSeller
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-transparent text-white border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setIsSeller(true)}
                className={`py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border ${
                  isSeller
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-transparent text-white border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
                Seller
              </button>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (errors.agreed) {
                    setErrors((prev) => ({ ...prev, agreed: '' }));
                  }
                }}
                className="h-4 w-4 rounded-none bg-[#1c1c1c] border border-neutral-700 checked:bg-white checked:border-white focus:ring-0 cursor-pointer accent-white"
              />
              <label htmlFor="terms" className="text-xs text-neutral-400 leading-normal select-none">
                I agree to Snitch's <span className="underline text-white cursor-pointer hover:text-neutral-300">Terms</span> & <span className="underline text-white cursor-pointer hover:text-neutral-300">Privacy Policy</span>.
              </label>
            </div>
            {errors.agreed && (
              <p className="text-[11px] text-red-500 mt-1.5 animate-fade-in">{errors.agreed}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold text-xs tracking-[0.2em] py-4 hover:bg-neutral-200 transition-all duration-300 uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-[1px] bg-neutral-800"></div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase select-none">
            or continue with
          </span>
          <div className="flex-1 h-[1px] bg-neutral-800"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => window.location.href = `http://localhost:3000/api/auth/google?role=${isSeller ? 'seller' : 'buyer'}`}
          className="w-full border border-neutral-800 bg-transparent py-3.5 flex items-center justify-center gap-2.5 text-[11px] font-bold tracking-[0.2em] hover:bg-[#1c1c1c] transition-all duration-300 text-white uppercase cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <div className="text-center text-xs text-neutral-400 mt-8">
          Already have an account?
          <button
            onClick={() => navigate('/login')}
            className="font-bold text-white hover:underline cursor-pointer ml-1.5 focus:outline-none"
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;
