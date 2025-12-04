"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiEye as EyeOff, FiEyeOff as Eye } from "react-icons/fi";
import { useRouter } from 'next/navigation';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './page.module.css';

const SignUpPage = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    password: '',
    confirmPassword: '',
    username: '',
    termsAccepted: false,
    secretWord1: '',
    secretWord2: '',
  });
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [ageMessage, setAgeMessage] = useState("");
  const [isDobValid, setIsDobValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [isSignUpValid, setIsSignUpValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => currentYear - i);
  }, []);

  const months = useMemo(() => [
    { value: 1, name: "January" }, { value: 2, name: "February" },
    { value: 3, name: "March" }, { value: 4, name: "April" },
    { value: 5, name: "May" }, { value: 6, name: "June" },
    { value: 7, name: "July" }, { value: 8, name: "August" },
    { value: 9, name: "September" }, { value: 10, name: "October" },
    { value: 11, name: "November" }, { value: 12, name: "December" },
  ], []);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  useEffect(() => {
    setIsMounted(true);
    
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
    });

    // Load saved form data from localStorage
    const savedData = localStorage.getItem('signUpFormData');
    const savedStep = localStorage.getItem('signUpStep');
    const savedDay = localStorage.getItem('signUpDay');
    const savedMonth = localStorage.getItem('signUpMonth');
    const savedYear = localStorage.getItem('signUpYear');

    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    if (savedStep) {
      setStep(parseInt(savedStep));
    }
    if (savedDay) setDay(savedDay);
    if (savedMonth) setMonth(savedMonth);
    if (savedYear) setYear(savedYear);
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('signUpFormData', JSON.stringify(formData));
      localStorage.setItem('signUpStep', step.toString());
      localStorage.setItem('signUpDay', day);
      localStorage.setItem('signUpMonth', month);
      localStorage.setItem('signUpYear', year);
    }
  }, [formData, step, day, month, year, isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  useEffect(() => {
    if (day && month && year) {
      const birthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      const today = new Date();
      const seventeenYearsAgo = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());

      if (birthDate <= seventeenYearsAgo) {
        setIsDobValid(true);
        setAgeMessage("✓ Age is valid!");
        const formattedDob = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, dob: formattedDob }));
      } else {
        setIsDobValid(false);
        setAgeMessage("❌ You must be at least 17 years old!");
        setFormData(prev => ({ ...prev, dob: '' }));
      }
    } else {
      setAgeMessage("");
      setIsDobValid(false);
      setFormData(prev => ({ ...prev, dob: '' }));
    }
  }, [day, month, year]);

  const passwordValidation = useMemo(() => {
    const password = formData.password;
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };
  }, [formData.password]);

  const isStep1Valid = useMemo(() => {
    return formData.name.trim() !== '' && formData.email.trim() !== '';
  }, [formData.name, formData.email]);

  const isStep2Valid = useMemo(() => {
    return isDobValid;
  }, [isDobValid]);

  const isStep3Valid = useMemo(() => {
    const { length, uppercase, number } = passwordValidation;
    return length && uppercase && number &&
      formData.password === formData.confirmPassword &&
      formData.termsAccepted;
  }, [formData.password, formData.confirmPassword, formData.termsAccepted, passwordValidation]);

  const isStep4Valid = useMemo(() => {
    return formData.username.trim().length > 3;
  }, [formData.username]);

  const isStep5Valid = useMemo(() => {
    return formData.secretWord1.trim() !== '' &&
      formData.secretWord2.trim() !== '' &&
      formData.secretWord1 !== formData.secretWord2;
  }, [formData.secretWord1, formData.secretWord2]);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep5Valid || isSubmitting) return;
    
    setIsSubmitting(true);
    setResMessage("");
    
    fetch(`/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        secretWord1: formData.secretWord1.toLowerCase().trim(),
        secretWord2: formData.secretWord2.toLowerCase().trim()
      }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Sign up failed, please try again!');
        }
        setResMessage("Sign Up Success! Redirecting...");
        setIsSignUpValid(true);
        
        // Clear localStorage after successful sign up
        localStorage.removeItem('signUpFormData');
        localStorage.removeItem('signUpStep');
        localStorage.removeItem('signUpDay');
        localStorage.removeItem('signUpMonth');
        localStorage.removeItem('signUpYear');
        
        setTimeout(() => router.push("/"), 2000);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsSignUpValid(false);
        setResMessage(error.message || "Sign Up Error, Please try again!");
        setIsSubmitting(false);
      });
  };

  if (!isMounted) {
    return null;
  }

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
        {/* Update progress indicators to show 5 steps */}
        <div className={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`${styles.progressStep} ${step >= s ? styles.progressStepActive : styles.progressStepInactive}`}>
              {s}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Name and Email */}
          {step === 1 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Create Your Account</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Name
                </label>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className={styles.input} 
                  placeholder="Input your full name" 
                />
              </div>

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
                />
              </div>
              
              <button 
                type="button" 
                onClick={nextStep} 
                disabled={!isStep1Valid} 
                className={styles.buttonWithMargin}
              >
                Next
              </button>

              <div className={styles.footer}>
                <span className={styles.footerText}>Already Have Account? </span>
                <Link href="/sign-in" className={styles.footerLink}>
                  Sign-In
                </Link>
              </div>
            </section>
          )}
          
          {/* STEP 2: Date of Birth */}
          {step === 2 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Verify Your Age</h2>
              <p className={styles.sectionDescriptionCenter}>
                This information will not be displayed publicly. It is used to verify your age.
              </p>

              <div className={styles.dobGrid}>
                <div className={styles.dobItem}>
                 
                  <label htmlFor="day" className={styles.label}>
                    Day
                  </label>
                  <select
                    id="day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className={styles.select}
                  >
                   
                    <option value="" disabled>Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.dobItem}>
                 
                  <label htmlFor="month" className={styles.label}>
                    Month
                  </label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={styles.select}
                  >
                   
                    <option value="" disabled>Month</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.dobItem}>
                 
                  <label htmlFor="year" className={styles.label}>
                    Year
                  </label>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={styles.select}
                  >
                    
                    <option value="" disabled>Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`${styles.ageMessage} ${isDobValid ? styles.ageMessageValid : styles.ageMessageInvalid}`}>
                {ageMessage}
              </div>

              <div className={styles.buttonGroup}>
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                 
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!isStep2Valid} 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  
                  Next
                </button>
              </div>
            </section>
          )}
          
          {/* STEP 3: Password */}
          {step === 3 && (
            <section className={styles.section}>
              
              <h2 className={styles.sectionTitle}>Account Security</h2>
              
              <div className={styles.formGroupMedium}>
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
                    placeholder="Create a strong password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className={styles.eyeButton}
                  >
                    
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <ul className={styles.passwordValidation}>
                
                <li className={passwordValidation.length ? styles.passwordValidationValid : ''}>At least 8 characters</li>
                <li className={passwordValidation.uppercase ? styles.passwordValidationValid : ''}>Contains an uppercase letter</li>
                <li className={passwordValidation.number ? styles.passwordValidationValid : ''}>Contains a number</li>
              </ul>
              
              <div className={styles.formGroup}>
               
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
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
                    
                    placeholder="Re-type your password" 
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
              
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                
                <p className={styles.errorMessage}>Passwords do not match.</p>
              )}
              
              <div className={styles.checkboxContainer}>
                <input 
                  type="checkbox" 
                  id="termsAccepted" 
                  name="termsAccepted" 
                  checked={formData.termsAccepted} 
                  onChange={handleChange} 
                  className={styles.checkbox} 
                />
                
                <label htmlFor="termsAccepted">
                  I agree to the <a href="/terms" className={styles.checkboxLink}>Terms & Conditions</a>
                </label>
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!isStep3Valid} 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Next
                </button>
              </div>
            </section>
          )}
          
          {/* STEP 4: Username */}
          {step === 4 && (
            <section className={styles.section}>
              
              <h2 className={styles.sectionTitle}>Choose a Username</h2>
              
              <div className={styles.formGroupLarge}>
                <label htmlFor="username" className={styles.label}>
                  Username
                </label>
                <input 
                  id="username" 
                  name="username" 
                  type="text" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                  className={styles.input} 
                  placeholder="Choose a unique username" 
                />
              </div>

              <div className={styles.buttonGroup}>
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!isStep4Valid} 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  
                  Next
                </button>
              </div>
            </section>
          )}
          
          {/* STEP 5: Secret Words */}
          {step === 5 && (
            <section className={styles.section}>
             
              <h2 className={styles.sectionTitle}>Secret Words</h2>
              <p className={styles.sectionDescriptionCenter}>
                Enter 2 secret words that will be used for password reset.
              </p>

              {/* First Secret Word */}
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
                  placeholder="Enter your first secret word" 
                />
              </div>

              {/* Second Secret Word */}
              <div className={styles.formGroupLarge}>
                
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
                  placeholder="Enter your second secret word" 
                />
              </div>

              {formData.secretWord1 && formData.secretWord2 && formData.secretWord1 === formData.secretWord2 && (
                
                <p className={styles.errorMessage}>Secret words must be different.</p>
              )}

              {resMessage && (
                <div className={`${styles.responseMessage} ${isSignUpValid ? styles.responseMessageSuccess : styles.responseMessageError}`}>
                  {resMessage}
                </div>
              )}
              
              <div className={styles.buttonGroup}>
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!isStep5Valid || isSubmitting} 
                  className={`${styles.button} ${styles.buttonSuccess}`}
                >
                  {isSubmitting ? (
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
                      Signing Up...
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </div>
            </section>
          )}
        </form>
      </div>
    </main>
  );
};

export default SignUpPage;
