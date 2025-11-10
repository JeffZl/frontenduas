//'use client'
import React from 'react';

interface ProfileHeaderElements {
    name: string;
}

export default function ProfileHeader({name}: ProfileHeaderElements) {
    return (
        <div className="profile-header">
            <div className="header-info">
                <h1 className="text-m font-bold">{name}</h1>
            </div>
        </div>
    )
} 
