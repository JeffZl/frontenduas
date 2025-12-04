import React from 'react';

interface UserBioElements {
    name?: string;
    handle?: string;
    bio?: string;
    birthDate?: string;
    joinDate?: string;
    followingCount?: number;
    followersCount?: number;
    location?: string;
    website?: string;
}

export default function UserBio ({
    name, handle, bio, birthDate, joinDate, followingCount, followersCount, location, website
}: UserBioElements) {
    return (
        <div className="bio-details mt-2 px-4.5">
            <h1 className="display-name">{name || "User"}</h1>
            <p className="user-handle">@{handle || "unknown"}</p>

            {bio && <p className="bio-text">{bio}</p>}

            {(location || website) && (
                <div className="acc-info mb-2">
                    {location && <p className="text-gray-600 dark:text-gray-400">{location}</p>}
                    {website && (
                        <p className="text-blue-500 hover:underline">
                            <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer">
                                {website}
                            </a>
                        </p>
                    )}
                </div>
            )}

            <div className="acc-info">
                {birthDate && birthDate !== "Not set" && <p>Born: {birthDate}</p>}
                {joinDate && <p>Joined: {joinDate}</p>}
            </div>

            <div className="follow-stats">
                <span className="stat-item">
                    <strong>{followingCount || 0}</strong> Following
                </span>
                <span className="stat-item">
                    <strong>{followersCount || 0}</strong> Followers
                </span>
            </div>
        </div>
    )
}