'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './style.module.css';

interface ProfileHeaderElements {
    name: string;
    tweetsCount?: number;
}

export default function ProfileHeader({ name, tweetsCount }: ProfileHeaderElements) {
    const router = useRouter();

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className={styles.profileHeader}>
            <button className={styles.backButton} onClick={handleBack} type="button">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
                </svg>
            </button>
            <div className={styles.headerInfo}>
                <div className={styles.headerName}>{name}</div>
                {tweetsCount !== undefined && (
                    <div className={styles.headerTweetCount}>{tweetsCount} posts</div>
                )}
            </div>
        </div>
    );
}
