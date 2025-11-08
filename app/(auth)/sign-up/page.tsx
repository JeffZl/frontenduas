"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { FiEye as EyeOff, FiEyeOff as Eye } from "react-icons/fi";
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
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
    if (!isStep5Valid) return;
    console.log(`${baseUrl}/api/auth/sign-up`)
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
        console.log('Sign up success!');
        setResMessage("Sign Up Success! You will be redirected in 3 seconds");
        setIsSignUpValid(true);
        setTimeout(() => router.push("/"), 3000);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsSignUpValid(false);
        setResMessage(error.message || "Sign Up Error, Please try again!");
      });
  };

  return (
    <main className={`min-h-screen flex items-center justify-center bg-black text-gray-100 p-4`}>
      <div className="bg-black border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl shadow-sky-900/20">
        {/* Update progress indicators to show 5 steps */}
        <div className="flex justify-center items-center mb-8 space-x-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${step >= s ? 'bg-sky-500 text-black font-bold' : 'bg-gray-800 text-gray-500'}`}>
              {s}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Name and Email */}
          {step === 1 && (
            <section className="animate-fade-in">
              <h2 className="text-2xl font-semibold text-center mb-6">Create Your Account</h2>
              
              <div className="text-left mb-5">
                <label htmlFor="name" className="text-xs text-gray-400 mb-1 block">
                  Name
                </label>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 focus:border-sky-500 focus:outline-none transition-colors" 
                  placeholder="Input your full name" 
                  suppressHydrationWarning
                />
              </div>

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
                />
              </div>
              
              <button 
                type="button" 
                onClick={nextStep} 
                disabled={!isStep1Valid} 
                className="w-full mt-4 py-3 rounded-lg font-semibold transition-all bg-sky-500 text-black enabled:hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Next
              </button>

              <div className="text-center mt-6 text-sm">
                <span className="text-gray-400">Already Have Account? </span>
                <Link href="/sign-in" className="text-sky-500 hover:underline font-medium">
                  Sign-In
                </Link>
              </div>
            </section>
          )}
          
          {/* STEP 2: Date of Birth */}
          {step === 2 && (
            <section className="animate-fade-in">
              <h2 className="text-2xl font-semibold text-center mb-6">Verify Your Age</h2>
              <p className="text-sm text-gray-400 mb-6 text-justify">
                This information will not be displayed publicly. It is used to verify your age.
              </p>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 text-left">
                 
                  <label htmlFor="day" className="text-xs text-gray-400 mb-1 block">
                    Day
                  </label>
                  <select
                    id="day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 appearance-none focus:border-sky-500 focus:outline-none"
                  >
                   
                    <option value="" disabled>Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 text-left">
                 
                  <label htmlFor="month" className="text-xs text-gray-400 mb-1 block">
                    Month
                  </label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 appearance-none focus:border-sky-500 focus:outline-none"
                  >
                   
                    <option value="" disabled>Month</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 text-left">
                 
                  <label htmlFor="year" className="text-xs text-gray-400 mb-1 block">
                    Year
                  </label>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 appearance-none focus:border-sky-500 focus:outline-none"
                  >
                    
                    <option value="" disabled>Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`text-sm mb-5 h-5 flex items-center justify-center ${isDobValid ? "text-green-500" : "text-red-500"}`}>
                {ageMessage}
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-gray-700 text-gray-100 hover:bg-gray-600"
                >
                 
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!isStep2Valid} 
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-sky-500 text-black enabled:hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  
                  Next
                </button>
              </div>
            </section>
          )}
          
          {/* STEP 3: Password */}
          {step === 3 && (
            <section className="animate-fade-in">
              
              <h2 className="text-2xl font-semibold text-center mb-6">Account Security</h2>
              
              <div className="text-left mb-4">
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
                    placeholder="Create a strong password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <ul className="text-sm mb-5 space-y-1 text-gray-400">
                
                <li className={passwordValidation.length ? 'text-green-500' : ''}>At least 8 characters</li>
                <li className={passwordValidation.uppercase ? 'text-green-500' : ''}>Contains an uppercase letter</li>
                <li className={passwordValidation.number ? 'text-green-500' : ''}>Contains a number</li>
              </ul>
              
              <div className="text-left mb-2">
               
                <label htmlFor="confirmPassword" className="text-xs text-gray-400 mb-1 block">
                  Confirm Password
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
                    
                    placeholder="Re-type your password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                
                <p className="text-red-500 text-sm mt-1 mb-4">Passwords do not match.</p>
              )}
              
              <div className="flex items-center gap-2 my-6 text-sm">
                <input 
                  type="checkbox" 
                  id="termsAccepted" 
                  name="termsAccepted" 
                  checked={formData.termsAccepted} 
                  onChange={handleChange} 
                  className="w-4 h-4 accent-sky-500" 
                />
                
                <label htmlFor="termsAccepted">
                  I agree to the <a href="/terms" className="text-sky-500 hover:underline">Terms & Conditions</a>
                </label>
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-gray-700 text-gray-100 hover:bg-gray-600"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!isStep3Valid} 
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-sky-500 text-black enabled:hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </section>
          )}
          
          {/* STEP 4: Username */}
          {step === 4 && (
            <section className="animate-fade-in">
              
              <h2 className="text-2xl font-semibold text-center mb-6">Choose a Username</h2>
              
              <div className="text-left mb-6">
                <label htmlFor="username" className="text-xs text-gray-400 mb-1 block">
                  Username
                </label>
                <input 
                  id="username" 
                  name="username" 
                  type="text" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg p-3 focus:border-sky-500 focus:outline-none transition-colors" 
                  placeholder="Choose a unique username" 
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-gray-700 text-gray-100 hover:bg-gray-600"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!isStep4Valid} 
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-sky-500 text-black enabled:hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  
                  Next
                </button>
              </div>
            </section>
          )}
          
          {/* STEP 5: Secret Words */}
          {step === 5 && (
            <section className="animate-fade-in">
             
              <h2 className="text-2xl font-semibold text-center mb-6">Secret Words</h2>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Enter 2 secret words that will be used for password reset.
              </p>

              {/* First Secret Word */}
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
                  placeholder="Enter your first secret word" 
                />
              </div>

              {/* Second Secret Word */}
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
                  placeholder="Enter your second secret word" 
                />
              </div>

              {formData.secretWord1 && formData.secretWord2 && formData.secretWord1 === formData.secretWord2 && (
                
                <p className="text-red-500 text-sm mb-4">Secret words must be different.</p>
              )}

              <div className={`text-sm mb-5 h-5 flex items-center justify-center ${isSignUpValid ? "text-green-500" : "text-red-500"}`}>
                {resMessage}
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-gray-700 text-gray-100 hover:bg-gray-600"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!isStep5Valid} 
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-green-500 text-black enabled:hover:opacity-90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Sign Up
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
