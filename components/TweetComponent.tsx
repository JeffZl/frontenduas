'use client'
import Image from "next/image"
import Link from "next/link"
import { FiHeart, FiMessageCircle, FiRepeat } from "react-icons/fi"
import "./TweetComponent.module.css"

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
        <article className="tweet-article">
            <div className="tweet-body">
                <Link href={`/profile/${tweet.author.handle}`}>
                    {tweet.author.profilePicture?.url ? (
                        <Image
                            src={tweet.author.profilePicture.url}
                            alt={tweet.author.name}
                            width={48}
                            height={48}
                            className="avatar"
                        />
                    ) : (
                        <div className="avatar-fallback">
                            <span>{tweet.author.name?.[0]?.toUpperCase() || "?"}</span>
                        </div>
                    )}
                </Link>

                <div className="tweet-content">
                    <div className="tweet-header">
                        <Link href={`/profile/${tweet.author.handle}`} className="name">
                        {tweet.author.name}
                        </Link>
                        <span className="handle">@{tweet.author.handle}</span>
                        <span>·</span>
                        <span className="time">{formatTime(tweet.createdAt)}</span>
                    </div>

                    {tweet.content && (
                        <p className="text">{tweet.content}</p>
                    )}

                    {tweet.media && tweet.media.length > 0 && (
                        <div className="media-wrapper">
                        {tweet.media.length === 1 ? (
                            <div className="media-single">
                            {tweet.media[0].mediaType === "video" ? (
                                <video
                                src={tweet.media[0].url}
                                controls
                                className="media-video"
                                poster={tweet.media[0].thumbnail}
                                />
                            ) : (
                                <Image
                                src={tweet.media[0].url}
                                alt={tweet.media[0].altText || "Tweet media"}
                                width={600}
                                height={400}
                                className="media-image"
                                />
                            )}
                            </div>
                        ) : (
                            <div className="media-grid">
                            {tweet.media.slice(0, 4).map((m, idx) => (
                                <div key={idx} className="media-grid-item">
                                {m.mediaType === "video" ? (
                                    <video
                                    src={m.url}
                                    controls
                                    className="media-video"
                                    poster={m.thumbnail}
                                    />
                                ) : (
                                    <Image
                                    src={m.url}
                                    alt={m.altText || `Media ${idx + 1}`}
                                    fill
                                    className="media-grid-image"
                                    />
                                )}
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    )}

                    <div className="tweet-actions">
                        <button className="action reply">
                        <FiMessageCircle />
                        <span>{tweet.repliesCount || 0}</span>
                        </button>
                        <button className="action retweet">
                        <FiRepeat />
                        <span>{tweet.retweetsCount || 0}</span>
                        </button>
                        <button className="action like">
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
