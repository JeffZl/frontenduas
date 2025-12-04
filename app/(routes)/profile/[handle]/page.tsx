"use client"
import React from "react"
import ProfileHeader from "@/components/Profile/ProfileHeader"
import UserBio from "@/components/Profile/UserBio"
import ProfileTabs from "@/components/Profile/ProfileTabs"
import EditProfileButton from "@/components/Profile/EditProfile"
import EditProfileModal from "@/components/Profile/EditProfileModal"
import Image from "next/image"
import { useState, useEffect } from "react"
import TweetComponent from "@/components/TweetComponent"
import { useRouter } from "next/navigation"

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
    createdAt: string;
    tweets?: Tweet[];
}

const Page = ({ params }: { params: Promise<{ handle: string }> }) => {
    const [user, setUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { handle } = await params
            
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

    const isOwnProfile = currentUser?.handle?.toLowerCase() === user?.handle?.toLowerCase();

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

    return (
        <div className="profile-main-content overflow-scroll max-h-[100vh] [&::-webkit-scrollbar]:hidden">
            {/* Profile Header */}
            <ProfileHeader name={user?.name || ""} />

            {/* Banner */}
            {user?.coverPicture?.url ? (
                <Image
                    src={user.coverPicture.url}
                    alt="Banner Image"
                    width={600}
                    height={200}
                    className="profile-banner-image"
                />
            ) : (
                <Image
                    src="/icons/banner.jpg"
                    alt="Banner Image"
                    width={600}
                    height={200}
                    className="profile-banner-image"
                />
            )}

            {/* Profile details */}
            <div className="profile-details-section">
                <div>   
                    {user?.profilePicture?.url ? (
                        <Image
                            src={user?.profilePicture?.url}
                            alt="Profile Picture"
                            width={120}
                            height={120}
                            className="absolute bg-[var(--color-surface)] overflow-hidden w-[120px] h-[120px] rounded-full border-[4px] border-[var(--color-background)] top-[-60px] left-4 z-[100]"
                        />
                    ) : (
                        <div className="absolute w-[120px] h-[120px] flex items-center justify-center rounded-full bg-gray-700 border-[4px] border-[var(--color-background)] top-[-60px] left-4 z-[100]">
                            <span className="text-white font-bold text-4xl">
                            {user?.name?.[0]?.toUpperCase() || "?"}
                            </span>
                        </div>
                    )}

                </div>

                {isOwnProfile && (
                    <div className="profile-control">
                        <EditProfileButton onClick={() => setIsEditModalOpen(true)} />
                    </div>
                )}

                {user && (
                    <UserBio
                        name={user.name}
                        handle={user.handle}
                        bio={user.bio}
                        birthDate={formatBirthDate(user.birthdate)}
                        joinDate={user.createdAt ? new Date(user.createdAt).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        }) : ""}
                        followingCount={user.followingCount}
                        followersCount={user.followersCount}
                        location={user.location}
                        website={user.website}
                    />
                )}

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <EditProfileModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        user={user}
                        onSave={handleSaveProfile}
                    />
                )}

                <ProfileTabs />
            </div>

            {/* ✅ Tweet feed */}
            <div className="mt-6">
                {user && user.tweetsCount > 0 && user.tweets ? (
                    user.tweets.map((tweet: Tweet) => {
                        console.log(tweet)
                        return(
                        <TweetComponent key={tweet._id} tweet={tweet} />
                    )})
                ) : (
                    <div className="p-4 text-center text-gray-400">
                        No tweets yet
                    </div>
                )}
            </div>
        </div>
    );
}
export default Page