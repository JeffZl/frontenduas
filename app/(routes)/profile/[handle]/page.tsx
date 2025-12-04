"use client"
import React from "react"
import ProfileHeader from "@/components/Profile/ProfileHeader"
import UserBio from "@/components/Profile/UserBio"
import ProfileTabs, { ProfileTab } from "@/components/Profile/ProfileTabs"
import EditProfileButton from "@/components/Profile/EditProfile"
import EditProfileModal from "@/components/Profile/EditProfileModal"
import Image from "next/image"
import { useState, useEffect } from "react"
import TweetComponent from "@/components/TweetComponent"
import { useRouter } from "next/navigation"
import styles from "./style.module.css"

interface Tweet {
    _id: string
    content?: string
    media?: Array<{
        url: string
        mediaType: string
        thumbnail?: string
        altText?: string
    }>
    author: {
        _id: string
        handle: string
        name: string
        profilePicture?: {
            url: string
        }
    }
    likesCount: number
    retweetsCount: number
    repliesCount: number
    createdAt: string
    originalTweet?: Tweet
}

interface User {
    _id: string;
    handle: string;
    name: string;
    bio?: string;
    profilePicture?: { url: string; publicId?: string; format?: string };
    coverPicture?: { url: string; publicId?: string; format?: string };
    location?: string;
    website?: string;
    birthdate?: string | Date;
    followersCount: number;
    followingCount: number;
    tweetsCount: number;
    likesCount?: number;
    followers?: Array<string>;
    following?: Array<string>;
    createdAt: string;
    tweets?: Tweet[];
}

const Page = ({ params }: { params: Promise<{ handle: string }> }) => {
    const [user, setUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileHandle, setProfileHandle] = useState("");
    const [activeTab, setActiveTab] = useState<ProfileTab>("Posts");
    const [likedTweets, setLikedTweets] = useState<Tweet[]>([]);
    const [likedLoading, setLikedLoading] = useState(false);
    const [likedError, setLikedError] = useState<string | null>(null);
    const [hasFetchedLikes, setHasFetchedLikes] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { handle } = await params
            setProfileHandle(handle)
            
            // Fetch profile user
            try {
                const res = await fetch(`/api/user/${handle}`, {
                    cache: "no-store",
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Failed to fetch user");

                const { user: fetchedUser } = await res.json();
                setUser(fetchedUser);
            } catch (error) {
                console.error("Error fetching user:", error);
            }

            // Fetch current user to check if they're viewing their own profile
            try {
                const res = await fetch("/api/user/me", {
                    cache: "no-store",
                    credentials: "include",
                });

                if (res.ok) {
                    const { user: current } = await res.json();
                    setCurrentUser(current);
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchData();
    }, [params]);

    useEffect(() => {
        setActiveTab("Posts");
        setLikedTweets([]);
        setLikedError(null);
        setHasFetchedLikes(false);
    }, [profileHandle]);

    useEffect(() => {
        if (!user || !currentUser?._id) return;

        const followerIds = (user.followers || []).map((id) => id?.toString());
        setIsFollowing(followerIds.includes(currentUser._id));
    }, [user, currentUser]);

    const isOwnProfile = currentUser?.handle?.toLowerCase() === user?.handle?.toLowerCase();

    const fetchLikedTweets = async (handleValue: string) => {
        if (!handleValue) return;
        setLikedLoading(true);
        setLikedError(null);

        try {
            const res = await fetch(`/api/user/${handleValue}/likes`, {
                cache: "no-store",
                credentials: "include",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to fetch liked posts");
            }

            const { tweets } = await res.json();
            const filtered = (tweets || []).filter(
                (tweet: Tweet | null): tweet is Tweet =>
                    Boolean(tweet && tweet.author && tweet.author.handle)
            );
            setLikedTweets(filtered);
            setHasFetchedLikes(true);
        } catch (error) {
            console.error("Error fetching liked tweets:", error);
            setLikedError(error instanceof Error ? error.message : "Failed to fetch liked posts");
        } finally {
            setLikedLoading(false);
        }
    };

    const handleTabChange = (tab: ProfileTab) => {
        setActiveTab(tab);
        if (tab === "Likes" && !hasFetchedLikes && profileHandle) {
            fetchLikedTweets(profileHandle);
        }
    };

    const handleToggleFollow = async () => {
        if (!user || !currentUser?._id || followLoading) return;

        setFollowLoading(true);
        const willFollow = !isFollowing;

        try {
            const res = await fetch(`/api/user/${user.handle}/follow`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ currentUserId: currentUser._id }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update follow status");
            }

            setIsFollowing(willFollow);
            setUser((prev) => {
                if (!prev) return prev;
                const followerSet = new Set((prev.followers || []).map((id) => id?.toString()));
                if (willFollow) {
                    followerSet.add(currentUser._id);
                } else {
                    followerSet.delete(currentUser._id);
                }

                return {
                    ...prev,
                    followersCount: Math.max(0, prev.followersCount + (willFollow ? 1 : -1)),
                    followers: Array.from(followerSet),
                };
            });
            setCurrentUser((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    followingCount: Math.max(0, prev.followingCount + (willFollow ? 1 : -1)),
                };
            });
        } catch (error) {
            console.error("Error updating follow status:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleSaveProfile = async (updateData: Record<string, unknown>) => {
        if (!user) return;

        try {
            const res = await fetch(`/api/user/${user.handle}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update profile");
            }

            const { user: updatedUser } = await res.json();
            setUser(updatedUser as User);
            
            // Refresh the page to show updated data
            router.refresh();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to update profile");
        }
    };

    const formatBirthDate = (birthdate: string | Date | undefined) => {
        if (!birthdate) return "Not set";
        const date = new Date(birthdate);
        if (isNaN(date.getTime())) return "Not set";
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatJoinDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className={styles.profileContainer}>
            {/* Profile Header */}
            <ProfileHeader name={user?.name || ""} tweetsCount={user?.tweetsCount} />

            {/* Banner */}
            <div className={styles.bannerContainer}>
                {user?.coverPicture?.url ? (
                    <Image
                        src={user.coverPicture.url}
                        alt="Banner"
                        fill
                        className={styles.bannerImage}
                        sizes="600px"
                        priority
                    />
                ) : (
                    <Image
                        src="/icons/banner.jpg"
                        alt="Banner"
                        fill
                        className={styles.bannerImage}
                        sizes="600px"
                        priority
                    />
                )}
            </div>

            {/* Profile Info */}
            <div className={styles.profileInfo}>
                <div className={styles.profileTopSection}>
                    {/* Profile Picture - Overlapping Banner */}
                    <div className={styles.profilePictureContainer}>
                        {user?.profilePicture?.url ? (
                            <Image
                                src={user.profilePicture.url}
                                alt="Profile"
                                width={140}
                                height={140}
                                className={styles.profilePicture}
                            />
                        ) : (
                            <div className={styles.profilePictureFallback}>
                                {user?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                        )}
                    </div>

                    <div className={styles.profileActions}>
                        {isOwnProfile ? (
                            <EditProfileButton onClick={() => setIsEditModalOpen(true)} />
                        ) : (
                            <button
                                type="button"
                                onClick={handleToggleFollow}
                                className={`${styles.followButton} ${isFollowing ? styles.following : ""}`}
                                disabled={followLoading}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>
                </div>

                {/* User Details */}
                {user && (
                    <UserBio
                        name={user.name}
                        handle={user.handle}
                        bio={user.bio}
                        birthDate={formatBirthDate(user.birthdate)}
                        joinDate={user.createdAt ? formatJoinDate(user.createdAt) : ""}
                        followingCount={user.followingCount}
                        followersCount={user.followersCount}
                        location={user.location}
                        website={user.website}
                    />
                )}
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    onSave={handleSaveProfile}
                />
            )}

            {/* Tabs */}
            <ProfileTabs activeTab={activeTab} onChange={handleTabChange} />

            {/* Tweets */}
            <div className={styles.tweetsContainer}>
                {activeTab === "Likes" && likedLoading ? (
                    <div className={styles.noTweets}>Loading likes...</div>
                ) : (() => {
                    const sourceTweets =
                        activeTab === "Likes" ? likedTweets : user?.tweets || [];
                    if (sourceTweets.length === 0) {
                        return (
                            <div className={styles.noTweets}>
                                {activeTab === "Likes"
                                    ? likedError || "No liked posts yet"
                                    : "No posts yet"}
                            </div>
                        );
                    }

                    return sourceTweets
                        .filter((tweet: Tweet | null): tweet is Tweet =>
                            Boolean(tweet && tweet.author && tweet.author.handle)
                        )
                        .map((tweet: Tweet, index: number) => {
                            const key =
                                tweet._id ||
                                `${tweet.createdAt}-${tweet.author?.handle || "unknown"}-${index}`;
                            return <TweetComponent key={key} tweet={tweet} />;
                        });
                })()}
            </div>
        </div>
    );
}

export default Page