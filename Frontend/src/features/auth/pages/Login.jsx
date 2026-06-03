import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';

const Login = () => {
  const { user,isLoading } = useSelector((state) => state.auth);  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
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
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      tempErrors.password = 'Password is required';
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
      await login(
        formData.email.toLowerCase().trim(),
        formData.password
      );
      
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setSubmitError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if(isLoading){
    return (
        <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white">
            <svg className="animate-spin h-8 w-8 text-white mb-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 relative bg-[url('/dark_luxury_background.png')] bg-cover bg-center bg-fixed bg-no-repeat font-sans text-white">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      <div className="relative w-full max-w-[450px] bg-[#141414]/90 text-white px-8 py-10 sm:px-10 sm:py-12 shadow-[0_32px_64px_rgba(0,0,0,0.8)] border border-neutral-900 transition-all duration-300">
        
        {/* Success Modal Overlay */}
        {loginSuccess && (
          <div className="absolute inset-0 bg-[#141414] z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black mb-6 shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-serif text-3xl text-white tracking-widest uppercase mb-2">Welcome Back</h2>
            <p className="text-neutral-400 text-xs font-semibold tracking-widest uppercase mb-4">Login successful</p>
            <div className="h-[2px] w-12 bg-white my-2"></div>
            <p className="text-neutral-400 text-xs mt-4 animate-pulse">Entering dashboard...</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-[0.3em] font-normal text-white uppercase">
            S N I T C H
          </h1>
          <p className="font-sans text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase mt-2">
            Sign In to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Banner */}
          {submitError && (
            <div className="bg-red-950/50 border border-red-900/50 p-3 text-xs text-red-400 animate-slide-in">
              <p className="font-bold">Authentication Failed</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          )}

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

          {/* Password */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-[10px] font-semibold tracking-wider text-neutral-400 block uppercase">
                Password
              </label>
              <button 
                type="button" 
                onClick={() => alert('Password reset is not configured.')}
                className="text-[10px] text-neutral-500 hover:text-white transition-colors uppercase tracking-wider"
              >
                Forgot?
              </button>
            </div>
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
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1.5 animate-fade-in">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold text-xs tracking-[0.2em] py-4 hover:bg-neutral-200 transition-all duration-300 uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed mt-8"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              'Sign In'
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
          onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}
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
          Don't have an account?
          <button
            onClick={() => navigate('/register')}
            className="font-bold text-white hover:underline cursor-pointer ml-1.5 focus:outline-none"
          >
            Register
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
