'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

const TermsAndConditions: React.FC = () => {
  const router = useRouter();


  return (
    <div className={styles.main}>
      <div className={styles.card}>
        {/* Back Link */}
        <Link
          href="/sign-up" 
          className={styles.backLink}
        >
          &larr; Back
        </Link>
        
        {/* Header */}
        <h1 className={styles.header}>
          Terms and Conditions of Use
        </h1>
        <p className={styles.headerDate}>
          Last updated: September 26, 2025
        </p>
        
        {/* Content */}
        <div className={styles.content}>
          <p className={styles.intro}>
            Welcome to CIRQULATE! These Terms and Conditions ("Terms") govern your access to and use of our website, services, and applications (collectively, the "Service"). Please read these Terms carefully.
          </p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              1. Acceptance of Terms
            </h2>
            <p className={styles.sectionText}>
              By creating an account or using our Service, <strong className={styles.strong}>you</strong> agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these Terms, you may not access or use our Service.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              2. User Accounts
            </h2>
            <p className={styles.sectionTextMargin}>
              To access most features of the Service, you must register for an account. When you register, you agree to:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet}>•</span>
                <span>Provide accurate, current, and complete information.</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet}>•</span>
                <span>Maintain the security of your password and accept full responsibility for all activities that occur under your account.</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet}>•</span>
                <span>Promptly notify us if you discover any security breaches or unauthorized use of your account.</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet}>•</span>
                <span>You must be at least <strong className={styles.strong}>17 years old</strong> to create an account and use the Service.</span>
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              3. User Content
            </h2>
            <p className={styles.sectionTextMargin}>
              You are solely responsible for all text, images, videos, links, or other materials you upload, post, or display ("Content") on the Service. By posting Content, you grant CIRQULATE a non-exclusive, royalty-free, worldwide license to use, store, and display your Content in connection with providing the Service.
            </p>
            <p className={styles.sectionText}>
              You agree not to post Content that is unlawful, defamatory, harassing, promotes hatred, or infringes on any third-party rights.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              4. Prohibited Conduct
            </h2>
            <p className={styles.sectionText}>
              You agree not to use the Service for any illegal purpose, impersonate others, harass other users, or use automated methods (like bots) to access the Service without our written permission.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              5. Privacy
            </h2>
            <p className={styles.sectionText}>
              Your privacy is important to us. Our use of the Service is also governed by our <strong className={styles.strong}>Privacy Policy</strong>, which explains how we collect and use your data.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              6. Account Termination
            </h2>
            <p className={styles.sectionText}>
              We reserve the right to suspend or terminate your account at any time with or without notice if we believe you have violated these Terms.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              7. Limitation of Liability
            </h2>
            <p className={styles.sectionText}>
              The Service is provided "AS IS" without warranty of any kind. CIRQULATE will not be responsible for any damages arising from your use of the Service.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              8. Changes to Terms
            </h2>
            <p className={styles.sectionText}>
              We may revise these Terms from time to time. The most current version will always be on this page. By continuing to use the Service after changes become effective, you agree to be bound by the revised Terms.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              9. Contact
            </h2>
            <p className={styles.sectionText}>
              If you have any questions about these Terms, please contact us at <strong className={styles.strong}>cirqulateCS@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;