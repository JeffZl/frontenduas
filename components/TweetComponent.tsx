'use client'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FiHeart, FiMessageCircle, FiRepeat } from "react-icons/fi"
import styles from "./TweetComponent.module.css"

interface tweetInterface {
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
        profilePicture?: { url: string }
    }
    likesCount?: number
    retweetsCount?: number
    repliesCount?: number
    createdAt: string
    originalTweet?: tweetInterface
    isLiked?: boolean
    isRetweeted?: boolean
}

const TweetComponent = ({ tweet: initialTweet }: { tweet: tweetInterface }) => {
    const router = useRouter()
    const [tweet, setTweet] = useState(initialTweet)
    const [isLiked, setIsLiked] = useState(tweet.isLiked || false)
    const [isRetweeted, setIsRetweeted] = useState(tweet.isRetweeted || false)

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diff < 60) return `${diff}s`
        if (diff < 3600) return `${Math.floor(diff / 60)}m`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`

        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const handleTweetClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on links, buttons, or interactive elements
        const target = e.target as HTMLElement
        if (
            target.tagName === 'A' ||
            target.tagName === 'BUTTON' ||
            target.closest('a') ||
            target.closest('button')
        ) {
            return
        }
        router.push(`/post/${tweet._id}`)
    }

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            const res = await fetch(`/api/post/${tweet._id}/like`, {
                method: "POST",
                credentials: "include",
            })

            if (res.ok) {
                const data = await res.json()
                setIsLiked(data.isLiked)
                setTweet({
                    ...tweet,
                    likesCount: data.likesCount,
                })
            }
        } catch (err) {
            console.error("Failed to toggle like:", err)
        }
    }

    const handleRetweet = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            const res = await fetch(`/api/post/${tweet._id}/retweet`, {
                method: "POST",
                credentials: "include",
            })

            if (res.ok) {
                const data = await res.json()
                setIsRetweeted(data.isRetweeted)
                setTweet({
                    ...tweet,
                    retweetsCount: data.retweetsCount,
                })
            }
        } catch (err) {
            console.error("Failed to toggle retweet:", err)
        }
    }

    const handleComment = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/post/${tweet._id}`)
    }

    return (
        <article className={styles.tweetArticle} onClick={handleTweetClick} style={{ cursor: 'pointer' }}>
            <div className={styles.tweetBody}>
                <Link href={`/profile/${tweet.author.handle}`} onClick={(e) => e.stopPropagation()}>
                    {tweet.author.profilePicture?.url ? (
                        <Image
                            src={tweet.author.profilePicture.url}
                            alt={tweet.author.name}
                            width={48}
                            height={48}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarFallback}>
                            <span>{tweet.author.name?.[0]?.toUpperCase() || "?"}</span>
                        </div>
                    )}
                </Link>

                <div className={styles.tweetContent}>
                    <div className={styles.tweetHeader}>
                        <Link href={`/profile/${tweet.author.handle}`} className={styles.name} onClick={(e) => e.stopPropagation()}>
                            {tweet.author.name}
                        </Link>
                        <span className={styles.handle}>@{tweet.author.handle}</span>
                        <span>·</span>
                        <span className={styles.time}>{formatTime(tweet.createdAt)}</span>
                    </div>

                    {tweet.content && (
                        <p className={styles.text}>{tweet.content}</p>
                    )}

                    {tweet.media && tweet.media.length > 0 && (
                        <div className={styles.mediaWrapper}>
                            {tweet.media.length === 1 ? (
                                <div className={styles.mediaSingle}>
                                    {tweet.media[0].mediaType === "video" ? (
                                        <video
                                            src={tweet.media[0].url}
                                            controls
                                            className={styles.mediaVideo}
                                            poster={tweet.media[0].thumbnail}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <Image
                                            src={tweet.media[0].url}
                                            alt={tweet.media[0].altText || "Tweet media"}
                                            width={600}
                                            height={400}
                                            className={styles.mediaImage}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className={styles.mediaGrid}>
                                    {tweet.media.slice(0, 4).map((m, idx) => (
                                        <div key={idx} className={styles.mediaGridItem}>
                                            {m.mediaType === "video" ? (
                                                <video
                                                    src={m.url}
                                                    controls
                                                    className={styles.mediaVideo}
                                                    poster={m.thumbnail}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <Image
                                                    src={m.url}
                                                    alt={m.altText || `Media ${idx + 1}`}
                                                    fill
                                                    className={styles.mediaGridImage}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.tweetActions}>
                        <button
                            className={`${styles.action} ${styles.reply}`}
                            onClick={handleComment}
                        >
                            <FiMessageCircle />
                            <span>{tweet.repliesCount || 0}</span>
                        </button>
                        <button
                            className={`${styles.action} ${styles.retweet} ${isRetweeted ? styles.active : ''}`}
                            onClick={handleRetweet}
                        >
                            <FiRepeat />
                            <span>{tweet.retweetsCount || 0}</span>
                        </button>
                        <button
                            className={`${styles.action} ${styles.like} ${isLiked ? styles.active : ''}`}
                            onClick={handleLike}
                        >
                            <FiHeart />
                            <span>{tweet.likesCount || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default TweetComponent