import React from 'react';
import styles from './style.module.css';

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

export default function UserBio({
    name, handle, bio, birthDate, joinDate, followingCount, followersCount, location, website
}: UserBioElements) {
    return (
        <div className={styles.userDetails}>
            <div className={styles.userName}>{name || "User"}</div>
            <div className={styles.userHandle}>@{handle || "unknown"}</div>

            {bio && <div className={styles.userBio}>{bio}</div>}

            {(location || website || birthDate || joinDate) && (
                <div className={styles.userMeta}>
                    {location && (
                        <div className={styles.metaItem}>
                            <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z"></path>
                            </svg>
                            {location}
                        </div>
                    )}
                    {website && (
                        <div className={styles.metaItem}>
                            <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.46 18l2.11-2.11c-.53-.63-1.03-1.36-1.49-2.19h1.66c.38.67.82 1.28 1.3 1.83H8.46zm1.89-5l.88-2h1.54l-.88 2h-1.54zm-2.11 0l-.89-2H9.8l.88 2H8.24zm-3.49 0l-.87-2H6.2l.88 2H4.75zM3.17 11l.88-2H5.6l-.88 2H3.17zm10.24 0l.88-2h1.54l-.88 2h-1.54zm4.14 0l.88-2h1.54l-.88 2h-1.54zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"></path>
                            </svg>
                            <a href={website.startsWith('http') ? website : `https://${website}`} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className={styles.metaLink}>
                                {website}
                            </a>
                        </div>
                    )}
                    {birthDate && birthDate !== "Not set" && (
                        <div className={styles.metaItem}>
                            <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 10c0-2.21 1.79-4 4-4v2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2h2c0 2.21-1.79 4-4 4s-4-1.79-4-4zm-2 8v-2h2v2H6zm0-4v-2h2v2H6zm10 4v-2h2v2h-2zm0-4v-2h2v2h-2zm-6 0v-2h4v2h-4zm-4 8c-1.1 0-2-.9-2-2h2v2zm10-2h2c0 1.1-.9 2-2 2v-2zM10 2h4v2h-4V2zm10 8h-2V8c0-1.1-.9-2-2-2h-1V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H6c-1.1 0-2 .9-2 2v2H2v2h2v2H2v2h2v2c0 1.1.9 2 2 2h1v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2h1c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2zm-4 10h-4v-2h4v2zm0-4h-4v-2h4v2z"></path>
                            </svg>
                            Born {birthDate}
                        </div>
                    )}
                    {joinDate && (
                        <div className={styles.metaItem}>
                            <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path>
                            </svg>
                            Joined {joinDate}
                        </div>
                    )}
                </div>
            )}

            <div className={styles.followStats}>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>{followingCount || 0}</span>
                    <span className={styles.statLabel}>Following</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>{followersCount || 0}</span>
                    <span className={styles.statLabel}>Followers</span>
                </div>
            </div>
        </div>
    );
}