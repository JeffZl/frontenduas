"use client";

import React, { useState, useEffect } from 'react';
import { FiEye as EyeOff, FiEyeOff as Eye } from "react-icons/fi"
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './page.module.css';

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

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

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
    setError("Sign In Success! Redirecting...")
    setTimeout(() => router.push("/"), 2000);
  };


  const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';

  return (
    <main className={styles.main}>
      <div className={styles.card} data-aos="fade-up">
        <div className={styles.logoContainer}>
          <Image 
            src="/logo.svg" 
            alt="Cirqulate Logo" 
            width={60} 
            height={60}
            priority
          />
        </div>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Sign-In To Your Account</h1>
          <p className={styles.description}>
           Welcome back! Please log in with your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className={styles.input} 
              placeholder="Input your email" 
              suppressHydrationWarning
            />
          </div>

          {/* Input Password */}
          <div className={styles.formGroupLast}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className={styles.inputPassword} 
                placeholder="Input your password" 
                suppressHydrationWarning
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className={styles.eyeButton}
                suppressHydrationWarning
              >
                <Eye size={20} className={showPassword ? styles.iconHidden : styles.iconVisible}/>
                <EyeOff size={20} className={showPassword ? styles.iconVisible : styles.iconHidden}/>
              </button>
            </div>
          </div>

          {/* Lupa Password */}
          <div className={styles.forgetPasswordWrapper}>
            <Link 
              href="/reset-password" 
              className={styles.forgetPasswordLink}
            >
              Forget Password?
            </Link>
          </div>

          <div className={`${styles.message} ${isSignInValid ? styles.messageSuccess : styles.messageError}`}>
            {error}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={!isFormValid || isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                Loading...
              </div>
            ) : (
              'Sign-In'
            )}
          </button>

         
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>atau</span>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Link ke Sign Up */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don't have an account?{' '}
              <Link 
                href="/sign-up" 
                className={styles.footerLink}
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