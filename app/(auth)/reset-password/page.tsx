"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEye as EyeOff, FiEyeOff as Eye } from "react-icons/fi"
import styles from './page.module.css';

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
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>
        
        <div className={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`${styles.progressStep} ${step >= s ? styles.progressStepActive : styles.progressStepInactive}`}>
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className={styles.section}>
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
                placeholder="Enter your email" 
                suppressHydrationWarning
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`${styles.button} ${styles.buttonPrimary}`}
              suppressHydrationWarning
            >
              {loading ? 'Loading...' : 'Next'}
            </button>
            
            <div className={styles.footer}>
              <span className={styles.footerText}>Ingat password? </span>
              <Link href="/sign-in" className={styles.footerLink}>
                Sign-In
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Secret Words Verification */}
        {step === 2 && (
          <form onSubmit={handleSecretWordsSubmit} className={styles.section}>
            <p className={styles.sectionDescription}>
              Enter the 2 secret words you created during registration.
            </p>

            <div className={styles.formGroupMedium}>
              <label htmlFor="secretWord1" className={styles.label}>
                Secret Word 1
              </label>
              <input 
                id="secretWord1" 
                name="secretWord1" 
                type="text" 
                value={formData.secretWord1} 
                onChange={handleChange} 
                required 
                className={styles.input} 
                placeholder="Enter the first secret word" 
                suppressHydrationWarning
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="secretWord2" className={styles.label}>
                Secret Word 2
              </label>
              <input 
                id="secretWord2" 
                name="secretWord2" 
                type="text" 
                value={formData.secretWord2} 
                onChange={handleChange} 
                required 
                className={styles.input} 
                placeholder="Enter the second secret word" 
                suppressHydrationWarning
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              {loading ? 'Verifying...' : 'Verification'}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordReset} className={styles.section}>
            <div className={styles.formGroupMedium}>
              <label htmlFor="newPassword" className={styles.label}>
                New password
              </label>
              <div className={styles.passwordWrapper}>
                <input 
                  id="newPassword" 
                  name="newPassword" 
                  type={showNewPassword ? 'text' : 'password'} 
                  value={formData.newPassword} 
                  onChange={handleChange} 
                  required 
                  className={styles.inputPassword} 
                  placeholder="Enter your new password" 
                  suppressHydrationWarning
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)} 
                  className={styles.eyeButton}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm New Password
              </label>
              <div className={styles.passwordWrapper}>
                <input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  className={styles.inputPassword} 
                  placeholder="Confirm new password" 
                  suppressHydrationWarning
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className={styles.eyeButton}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`${styles.button} ${styles.buttonSuccess}`}
            >
              {loading ? 'Loading...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Message Display */}
        {message && (
          <div className={`${styles.message} ${isSuccess ? styles.messageSuccess : styles.messageError}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
};

export default ResetPasswordPage;