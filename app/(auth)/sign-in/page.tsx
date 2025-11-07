"use client";

import React, { useState } from 'react';
import { FiEye as EyeOff, FiEyeOff as Eye } from "react-icons/fi"
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SignInPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("")
  const [isSignInValid, setIsSignInValid] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Sign-in failed");
      setIsSignInValid(false)
      setIsLoading(false)
      return;
    }

    setIsSignInValid(true)
    setError("Sign In Success! Redirecting in 3 seconds.")
    setIsLoading(false)
    setTimeout(() => router.push("/"), 3000);
  };


  const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';

  return (
    <main className={`min-h-screen flex items-center justify-center bg-black text-gray-100 p-4`}>
      <div className="bg-black border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl shadow-sky-900/20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Sign-In To Your Account</h1>
          <p className="text-sm text-gray-400">
           Welcome back! Please log in with your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="text-left mb-5">
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
              placeholder="Input your email" 
              suppressHydrationWarning
            />
          </div>

          {/* Input Password */}
          <div className="text-left mb-6">
            <label htmlFor="password" className="text-xs text-gray-400 mb-1 block">
              Password
            </label>
            <div className="relative">
              <input 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 pr-10 focus:border-sky-500 focus:outline-none transition-colors" 
                placeholder="Input your password" 
                suppressHydrationWarning
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                suppressHydrationWarning
              >
                <Eye size={20} className={showPassword ? 'hidden' : 'block'}/>
                <EyeOff size={20} className={showPassword ? 'block' : 'hidden'}/>
              </button>
            </div>
          </div>

          {/* Lupa Password */}
          <div className="text-right mb-6">
            <Link 
              href="/reset-password" 
              className="text-sm text-sky-500 hover:underline transition-colors"
            >
              Forget Password?
            </Link>
          </div>

          <div className={`text-sm mb-5 h-5 flex items-center justify-center ${isSignInValid ? "text-green-500" : "text-red-500"}`}>
            {error}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={!isFormValid || isLoading}
            className="w-full py-3 rounded-lg font-semibold transition-all bg-sky-500 text-black enabled:hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : (
              'Sign-In'
            )}
          </button>

         
          <div className="flex items-center mb-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-3 text-sm text-gray-500">atau</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Link ke Sign Up */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link 
                href="/sign-up" 
                className="text-sky-500 hover:underline font-semibold transition-colors"
              >
                Sign Here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default SignInPage;