'use client'
import Image from "next/image"
import Link from "next/link"
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
  likesCount: number
  retweetsCount: number
  repliesCount: number
  createdAt: string
  originalTweet?: tweetInterface
}

const TweetComponent = ({ tweet }: { tweet: tweetInterface }) => {

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

    return (
        <article className={styles.tweetArticle}>
            <div className={styles.tweetBody}>
                <Link href={`/profile/${tweet.author.handle}`}>
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
                        <Link href={`/profile/${tweet.author.handle}`} className={styles.name}>
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
                        <button className={`${styles.action} ${styles.reply}`}>
                        <FiMessageCircle />
                        <span>{tweet.repliesCount || 0}</span>
                        </button>
                        <button className={`${styles.action} ${styles.retweet}`}>
                        <FiRepeat />
                        <span>{tweet.retweetsCount || 0}</span>
                        </button>
                        <button className={`${styles.action} ${styles.like}`}>
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