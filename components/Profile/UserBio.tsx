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

            {(website || birthDate || joinDate) && (
                <div className={styles.userMeta}>
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