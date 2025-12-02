'use client';

import { useState, useEffect } from 'react';
import UserItem from './UserItem';
import styles from './Rightbar.module.css';

interface Suggestion {
    _id: string;
    name: string;
    handle: string;
    avatar: string;
}

export default function Rightbar() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await fetch("/api/user/suggestions", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    return (
        <section className={styles.rightbar}>
            <div className={styles.card}>
                <h3 className={styles.title}>Who to follow</h3>

                {loading ? (
                    <div className={styles.skeletonList}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.skeletonItem}>
                                <div className={styles.skeletonLeft}>
                                    <div className={styles.avatarPulse} />
                                    <div className={styles.nameGroup}>
                                        <div className={styles.textPulseShort} />
                                        <div className={styles.textPulseLong} />
                                    </div>
                                </div>
                                <div className={styles.btnPulse} />
                            </div>
                        ))}
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className={styles.noSuggest}>
                        <p>No suggestions available</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {suggestions.map(({ name, avatar, handle, _id }) => (
                            <UserItem key={_id} name={name} avatar={avatar} handle={handle} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
