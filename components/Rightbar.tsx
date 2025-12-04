'use client';

import { useState, useEffect } from 'react';
import UserItem from './UserItem';
import styles from './Rightbar.module.css';

interface Suggestion {
    _id: string;
    name: string;
    handle: string;
    avatar: string | null;
}

interface CurrentUser {
    _id: string;
    following?: string[];
}

export default function Rightbar() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [suggestionsRes, meRes] = await Promise.all([
                    fetch("/api/user/suggestions", { credentials: "include" }),
                    fetch("/api/user/me", { credentials: "include" }),
                ]);

                if (suggestionsRes.ok) {
                    const data = await suggestionsRes.json();
                    setSuggestions(data.suggestions || []);
                }

                if (meRes.ok) {
                    const { user } = await meRes.json();
                    setCurrentUser(user);
                    const ids = new Set<string>((user.following || []).map((id: string) => id.toString()));
                    setFollowingIds(ids);
                }
            } catch (error) {
                console.error("Error fetching rightbar data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleToggleFollow = async (handle: string) => {
        if (!currentUser?._id) return;

        const isCurrentlyFollowing = suggestions.some(s => s.handle === handle && followingIds.has(s._id));
        const willFollow = !isCurrentlyFollowing;

        try {
            const res = await fetch(`/api/user/${handle}/follow`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentUserId: currentUser._id }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update follow status");
            }

            setFollowingIds(prev => {
                const next = new Set(prev);
                const target = suggestions.find(s => s.handle === handle)?._id;
                if (!target) return next;
                if (willFollow) {
                    next.add(target);
                } else {
                    next.delete(target);
                }
                return next;
            });
        } catch (error) {
            console.error("Error updating follow from rightbar:", error);
        }
    };

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
                            <UserItem
                                key={_id}
                                name={name}
                                avatar={avatar || undefined}
                                handle={handle}
                                isFollowing={followingIds.has(_id)}
                                onToggleFollow={() => handleToggleFollow(handle)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
