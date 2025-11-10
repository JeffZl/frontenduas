'use client'
import React, {useState} from 'react';

const tabs: string[] = ['Posts', 'Likes'];

export default function ProfileTabs(){
    const [activeTab, setActiveTab] = useState<string>('Posts')

    const handleTabClick = (tabName: string, event: React.MouseEvent<HTMLButtonElement>) => {
        setActiveTab(tabName);
        console.log(`tab clicked:${tabName}`);
    }

    return (
        <div className="profile-tabs-container">
            <nav className="tabs-nav">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                        onClick={(e) => handleTabClick(tab, e)}>
                            {tab}
                    </button>
                ))}
            </nav>

            
        </div>
    )
}