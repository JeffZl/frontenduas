"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import TweetComponent from "@/components/TweetComponent"
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
    likesCount?: number
    retweetsCount?: number
    repliesCount?: number
    createdAt: string
    originalTweet?: Tweet
}

const Page = () => {
    const params = useParams()
    const router = useRouter()
    const hashtag = params?.hashtag as string
    const [tweets, setTweets] = useState<Tweet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (hashtag) {
            fetchTweets()
        }
    }, [hashtag])

    const fetchTweets = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`/api/tweets/${hashtag}`, {
                credentials: "include",
            })

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/sign-in")
                    return
                }
                throw new Error("Failed to fetch tweets")
            }

            const data = await res.json()
            setTweets(data.tweets || [])
        } catch (err: any) {
            console.error("Error fetching tweets:", err)
            setError(err.message || "Failed to load tweets")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className={`${styles.container}`}>
            <div className={`${styles.header}`}>
                <div className={styles.headerContent}>
                    <button
                        onClick={() => router.back()}
                        className={`${styles.backButton}`}
                    >
                        <FiArrowLeft className={styles.backIcon} />
                    </button>
                    <div>
                        <h1 className={styles.title}>#{hashtag}</h1>
                        <p className={`${styles.tweetCount}`}>
                            {tweets.length} tweets
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.loadingContainer}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.loadingItem}>
                            <div className={`${styles.avatarSkeleton}`} />
                            <div className={styles.contentSkeleton}>
                                <div className={styles.skeletonRow}>
                                    <div className={`${styles.skeleton} ${styles.skeletonSmall}`} />
                                    <div className={`${styles.skeleton} ${styles.skeletonMedium}`} />
                                </div>
                                <div className={`${styles.skeleton} ${styles.skeletonLarge}`} />
                                <div className={`${styles.skeleton} ${styles.skeletonPartial}`} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button
                        onClick={fetchTweets}
                        className={styles.retryButton}
                    >
                        Try again
                    </button>
                </div>
            ) : tweets.length === 0 ? (
                <div className={`${styles.emptyContainer}`}>
                    <p className={styles.emptyTitle}>No tweets found</p>
                    <p className={styles.emptySubtitle}>Be the first to tweet with #{hashtag}!</p>
                </div>
            ) : (
                <div>
                    {tweets.map((tweetData) => (
                        <TweetComponent key={tweetData._id} tweet={tweetData} />
                    ))}
                </div>
            )}
        </main>
    )
}

export default Page