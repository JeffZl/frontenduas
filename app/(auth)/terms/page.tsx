'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TermsAndConditions: React.FC = () => {
  const router = useRouter();


  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-100 p-6">
      <div className="bg-black border border-[#38444d] rounded-xl p-10 w-full max-w-4xl">
        {/* Back Link */}
        <Link
          href="/sign-up" 
          className="inline-block mb-6 text-[#1D9BF0] font-medium no-underline hover:underline"
        >
          &larr; Back
        </Link>
        
        {/* Header */}
        <h1 className="text-2xl font-semibold text-[#E7E9EA] mb-2 pb-4 border-b border-[#38444d]">
          Terms and Conditions of Use
        </h1>
        <p className="text-sm text-[#71767b] mb-8 mt-3">
          Last updated: September 26, 2025
        </p>
        
        {/* Content */}
        <div className="space-y-6">
          <p className="text-[#71767b] leading-7 text-justify">
            Welcome to CIRQULATE! These Terms and Conditions ("Terms") govern your access to and use of our website, services, and applications (collectively, the "Service"). Please read these Terms carefully.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-[#71767b] leading-7 text-justify">
              By creating an account or using our Service, <strong className="text-[#E7E9EA]">you</strong> agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these Terms, you may not access or use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              2. User Accounts
            </h2>
            <p className="text-[#71767b] leading-7 text-justify mb-4">
              To access most features of the Service, you must register for an account. When you register, you agree to:
            </p>
            <ul className="text-[#71767b] leading-7 space-y-2 ml-6 text-justify">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Provide accurate, current, and complete information.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Maintain the security of your password and accept full responsibility for all activities that occur under your account.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Promptly notify us if you discover any security breaches or unauthorized use of your account.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You must be at least <strong className="text-[#E7E9EA]">17 years old</strong> to create an account and use the Service.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              3. User Content
            </h2>
            <p className="text-[#71767b] leading-7 text-justify mb-4">
              You are solely responsible for all text, images, videos, links, or other materials you upload, post, or display ("Content") on the Service. By posting Content, you grant CIRQULATE a non-exclusive, royalty-free, worldwide license to use, store, and display your Content in connection with providing the Service.
            </p>
            <p className="text-[#71767b] leading-7 text-justify">
              You agree not to post Content that is unlawful, defamatory, harassing, promotes hatred, or infringes on any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              4. Prohibited Conduct
            </h2>
            <p className="text-[#71767b] leading-7 text-justify">
              You agree not to use the Service for any illegal purpose, impersonate others, harass other users, or use automated methods (like bots) to access the Service without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              5. Privacy
            </h2>
            <p className="text-[#71767b] leading-7 text-justify">
              Your privacy is important to us. Our use of the Service is also governed by our <strong className="text-[#E7E9EA]">Privacy Policy</strong>, which explains how we collect and use your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              6. Account Termination
            </h2>
            <p className="text-[#71767b] leading-7 text-justify">
              We reserve the right to suspend or terminate your account at any time with or without notice if we believe you have violated these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-[#71767b] leading-7 text-justify">
              The Service is provided "AS IS" without warranty of any kind. CIRQULATE will not be responsible for any damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              8. Changes to Terms
            </h2>
            <p className="text-[#71767b] leading-7 text-justify">
              We may revise these Terms from time to time. The most current version will always be on this page. By continuing to use the Service after changes become effective, you agree to be bound by the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E7E9EA] mt-8 mb-4">
              9. Contact
            </h2>
            <p className="text-[#71767b] leading-7 text-justify">
              If you have any questions about these Terms, please contact us at <strong className="text-[#E7E9EA]">cirqulateCS@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;