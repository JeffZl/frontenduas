import React from 'react';

interface UserBioElements {
    name: string;
    handle: string;
    bio: string;
    birthDate: string;
    joinDate: string;
    followingCount: number;
    followersCount: number;
}

export default function UserBio ({
    name, handle, bio, birthDate, joinDate, followingCount, followersCount
}: UserBioElements) {
    return (
        <div className="bio-details mt-2 px-4.5">
            <h1 className="display-name">{name}</h1>
            <p className="user-handle">@{handle}</p>

            <p className="bio-text">{bio}</p>

            <div className="acc-info">
                <p>Born: {birthDate}</p>
                <p>Joined: {joinDate}</p>
            </div>

            <div className="follow-stats">
                <span className="stat-item">
                    <strong>{followingCount}</strong> Following
                </span>
                <span className="stat-item">
                    <strong>{followersCount}</strong> Followers
                </span>
            </div>
        </div>
    )
}