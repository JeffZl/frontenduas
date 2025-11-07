"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEye as EyeOff, FiEyeOff as Eye } from "react-icons/fi"

const ResetPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    secretWord1: '',
    secretWord2: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  //step 1
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep(2);
        setMessage('');
      } else {
        setMessage(data.error || 'Email not found');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred, please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify secret words
  const handleSecretWordsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          secretWord1: formData.secretWord1.toLowerCase().trim(),
          secretWord2: formData.secretWord2.toLowerCase().trim(),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep(3);
        setMessage('');
      } else {
        setMessage(data.error || 'Secret word does not match');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred, please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New password does not match');
      setIsSuccess(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password successfully reset! Redirecting to login page...');
        setIsSuccess(true);
        setTimeout(() => router.push('/sign-in'), 3000);
      } else {
        setMessage(data.error || 'Password reset failed');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred, please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-gray-100 p-4">
      <div className="bg-black border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl shadow-sky-900/20">
        <h1 className="text-2xl font-semibold text-center mb-6">Reset Password</h1>
        
        <div className="flex justify-center items-center mb-8 space-x-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${step >= s ? 'bg-sky-500 text-black font-bold' : 'bg-gray-800 text-gray-500'}`}>
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="animate-fade-in">
            <div className="text-left mb-6">
              <label htmlFor="email" className="text-xs text-gray-400 mb-1 block">
                Email
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 focus:border-sky-500 focus:outline-none transition-colors" 
                placeholder="Enter your email" 
                suppressHydrationWarning
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all bg-sky-500 text-black hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              {loading ? 'Loading...' : 'Next'}
            </button>
            
            <div className="text-center mt-6 text-sm">
              <span className="text-gray-400">Ingat password? </span>
              <Link href="/sign-in" className="text-sky-500 hover:underline font-medium">
                Sign-In
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Secret Words Verification */}
        {step === 2 && (
          <form onSubmit={handleSecretWordsSubmit} className="animate-fade-in">
            <p className="text-sm text-gray-400 mb-6 text-center">
              Enter the 2 secret words you created during registration.
            </p>

            <div className="text-left mb-4">
              <label htmlFor="secretWord1" className="text-xs text-gray-400 mb-1 block">
                Secret Word 1
              </label>
              <input 
                id="secretWord1" 
                name="secretWord1" 
                type="text" 
                value={formData.secretWord1} 
                onChange={handleChange} 
                required 
                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 focus:border-sky-500 focus:outline-none transition-colors" 
                placeholder="Enter the first secret word" 
                suppressHydrationWarning
              />
            </div>
            
            <div className="text-left mb-6">
              <label htmlFor="secretWord2" className="text-xs text-gray-400 mb-1 block">
                Secret Word 2
              </label>
              <input 
                id="secretWord2" 
                name="secretWord2" 
                type="text" 
                value={formData.secretWord2} 
                onChange={handleChange} 
                required 
                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 focus:border-sky-500 focus:outline-none transition-colors" 
                placeholder="Enter the second secret word" 
                suppressHydrationWarning
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all bg-sky-500 text-black hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verification'}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="animate-fade-in">
            <div className="text-left mb-4">
              <label htmlFor="newPassword" className="text-xs text-gray-400 mb-1 block">
                New password
              </label>
              <div className="relative">
                <input 
                  id="newPassword" 
                  name="newPassword" 
                  type={showNewPassword ? 'text' : 'password'} 
                  value={formData.newPassword} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 pr-10 focus:border-sky-500 focus:outline-none transition-colors" 
                  placeholder="Enter your new password" 
                  suppressHydrationWarning
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="text-left mb-6">
              <label htmlFor="confirmPassword" className="text-xs text-gray-400 mb-1 block">
                Confirm New Password
              </label>
              <div className="relative">
                <input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 pr-10 focus:border-sky-500 focus:outline-none transition-colors" 
                  placeholder="Confirm new password" 
                  suppressHydrationWarning
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all bg-green-500 text-black hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
};

export default ResetPasswordPage;