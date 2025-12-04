'use client'
import React from 'react';
import styles from './style.module.css';

const tabs = ['Posts', 'Likes'] as const;

export type ProfileTab = typeof tabs[number];

interface ProfileTabsProps {
    activeTab: ProfileTab;
    onChange: (tab: ProfileTab) => void;
}

export default function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
    return (
        <div className={styles.tabsContainer}>
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                    onClick={() => onChange(tab)}
                    type="button"
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}