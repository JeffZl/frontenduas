"use client"

import TweetComponent from "@/components/TweetComponent"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation" 
import { useEffect, useState } from "react"
import { FiArrowLeft, FiHeart, FiMessageCircle, FiRepeat, FiMoreHorizontal } from "react-icons/fi"
import styles from "./style.module.css"


interface Media {
  url: string
  mediaType: string
  thumbnail?: string
  altText?: string
}

interface ProfilePicture {
  url: string
}

interface Author {
  _id: string
  handle: string
  name: string
  profilePicture?: ProfilePicture
}

interface Tweet {
  _id: string
  content?: string
  media?: Media[]
  author: Author
  likesCount?: number
  retweetsCount?: number
  repliesCount?: number
  createdAt: string
  originalTweet?: Tweet | null
  parentTweet?: string | null
  isLiked?: boolean
  isRetweeted?: boolean
}

interface QuoteResponse {
  tweet?: Tweet
  replies?: Tweet[]
  error?: string
}


const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSeconds < 60) return `${diffSeconds}s`
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

const formatAbsoluteTime = (dateString: string) => {
  const date = new Date(dateString)
  const time = date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  const datePart = date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${time} · ${datePart}`
}




const PostDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const tweetId = params?.id as string
  
  const [tweetData, setTweetData] = useState<Tweet | null>(null)
  const [replies, setReplies] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isRetweeted, setIsRetweeted] = useState(false)


  const fetchTweetData = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {

      const response = await fetch(`/api/post/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tweet details.")
      }
      const data: QuoteResponse = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setTweetData(data.tweet || null)
      setReplies(data.replies || [])

      if (data.tweet) {
        setIsLiked(data.tweet.isLiked || false)
        setIsRetweeted(data.tweet.isRetweeted || false)
      }

    } catch (err: any) {
      setError(err.message || "An unknown error occurred while fetching data.")
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setCurrentUser(data.user || data)
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err)
      }
    }
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (tweetId) {
      fetchTweetData(tweetId)
    }
  }, [tweetId])

  const handleLike = async () => {
    if (!tweetId) return

    try {
      const res = await fetch(`/api/post/${tweetId}/like`, {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        setIsLiked(data.isLiked)
        if (tweetData) {
          setTweetData({
            ...tweetData,
            likesCount: data.likesCount,
          })
        }
      }
    } catch (err) {
      console.error("Failed to toggle like:", err)
    }
  }

  const handleRetweet = async () => {
    if (!tweetId) return

    try {
      const res = await fetch(`/api/post/${tweetId}/retweet`, {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        setIsRetweeted(data.isRetweeted)
        if (tweetData) {
          setTweetData({
            ...tweetData,
            retweetsCount: data.retweetsCount,
          })
        }
      }
    } catch (err) {
      console.error("Failed to toggle retweet:", err)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim() || !tweetId || isReplying) return

    setIsReplying(true)
    try {
      const res = await fetch("/api/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: replyContent.trim(),
          parentTweet: tweetId,
        }),
      })

      if (res.ok) {
        setReplyContent("")
        await fetchTweetData(tweetId)
      }
    } catch (err) {
      console.error("Failed to post reply:", err)
    } finally {
      setIsReplying(false)
    }
  }


  const handleGoBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <main className={styles.container}>
        <header className={styles.header}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <FiArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>Post</h1>
          <div className={styles.headerActions}>
            <button className={styles.headerIconButton}>
              <FiMoreHorizontal size={20} />
            </button>
          </div>
        </header>
        <div className={styles.loadingContainer}>
          <p>Loading tweet...</p>
        </div>
      </main>
    )
  }

  if (error || !tweetData) {
    return (
      <main className={styles.container}>
        <header className={styles.header}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <FiArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>Post</h1>
          <div className={styles.headerActions}>
            <button className={styles.headerIconButton}>
              <FiMoreHorizontal size={20} />
            </button>
          </div>
        </header>
        <div className={styles.errorContainer}>
          <p>Error: {error || "Tweet not found."}</p>
        </div>
      </main>
    )
  }

  const tweet = tweetData;
  const authorProfilePic = tweet.author.profilePicture?.url && tweet.author.profilePicture.url.trim() !== '' 
    ? tweet.author.profilePicture.url 
    : null;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleGoBack} className={styles.backButton}>
          <FiArrowLeft size={20} />
        </button>
        <h1 className={styles.title}>Post</h1>
        <div className={styles.headerActions}>
          <button className={styles.headerIconButton}>
            <FiMoreHorizontal size={20} />
          </button>
        </div>
      </header>

      <section className={styles.tweetDetail}>
        {/* Author Info */}
        <div className={styles.authorHeader}>
          <div className={styles.authorInfo}>
            <div className={styles.profilePicWrapper}>
              {authorProfilePic ? (
                <Image 
                  src={authorProfilePic} 
                  alt={tweet.author.name} 
                  width={48} 
                  height={48} 
                  className={styles.profilePic} 
                />
              ) : (
                <div className={styles.profilePicPlaceholder}>
                  {tweet.author.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className={styles.names}>
              <div className={styles.nameRow}>
                <p className={styles.name}>{tweet.author.name}</p>
              </div>
              <p className={styles.handle}>@{tweet.author.handle}</p>
            </div>
          </div>
          <button className={styles.moreButton}>
            <FiMoreHorizontal size={20} />
          </button>
        </div>

        {/* Tweet Content */}
        {tweet.content && <p className={styles.tweetContent}>{tweet.content}</p>}

        {/* Media */}
        {tweet.media && tweet.media.length > 0 && (
          <div className={styles.mediaContainer}>
            <Image 
              src={tweet.media[0].url} 
              alt={tweet.media[0].altText || "Tweet media"} 
              width={600}
              height={400}
              className={styles.mediaImage}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}

        {/* Time and Date */}
        <div className={styles.metaInfo}>
          <p className={styles.timeAndDate}>
            {formatAbsoluteTime(tweet.createdAt)}
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.engagementMetrics}>
          <div className={styles.metricItem}>
            <div className={styles.metricIconWrapper}>
              <FiMessageCircle size={18} className={styles.metricIcon} />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricValue}>{tweet.repliesCount || 0}</span>
              <span className={styles.metricLabel}>Replies</span>
            </div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricIconWrapper}>
              <FiRepeat size={18} className={styles.metricIcon} />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricValue}>{tweet.retweetsCount || 0}</span>
              <span className={styles.metricLabel}>Retweets</span>
            </div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricIconWrapper}>
              <FiHeart size={18} className={styles.metricIcon} />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricValue}>{tweet.likesCount || 0}</span>
              <span className={styles.metricLabel}>Likes</span>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <button className={`${styles.actionButton} ${styles.reply}`}>
            <FiMessageCircle size={20} className={styles.actionIcon} />
            {(tweet.repliesCount || 0) > 0 && (
              <span className={styles.actionCount}>
                {tweet.repliesCount! > 1000 
                  ? `${(tweet.repliesCount! / 1000).toFixed(1)}K` 
                  : tweet.repliesCount}
              </span>
            )}
          </button>
          <button 
            className={`${styles.actionButton} ${styles.retweet} ${isRetweeted ? styles.active : ''}`}
            onClick={handleRetweet}
          >
            <FiRepeat size={20} className={styles.actionIcon} />
            {(tweet.retweetsCount || 0) > 0 && (
              <span className={styles.actionCount}>
                {tweet.retweetsCount! > 1000 
                  ? `${(tweet.retweetsCount! / 1000).toFixed(1)}K` 
                  : tweet.retweetsCount}
              </span>
            )}
          </button>
          <button 
            className={`${styles.actionButton} ${styles.like} ${isLiked ? styles.active : ''}`}
            onClick={handleLike}
          >
            <FiHeart size={20} className={styles.actionIcon} />
            {(tweet.likesCount || 0) > 0 && (
              <span className={styles.actionCount}>
                {tweet.likesCount! > 1000 
                  ? `${(tweet.likesCount! / 1000).toFixed(1)}K` 
                  : tweet.likesCount}
              </span>
            )}
          </button>
        </div>

        <hr className={styles.divider} />

      </section>

      {/* Reply Input Section */}
      <section className={styles.replyInputSection}>
        <div className={styles.replyInputWrapper}>
          <div className={styles.replyProfilePic}>
            {currentUser?.profilePicture?.url && currentUser.profilePicture.url.trim() !== '' ? (
              <Image
                src={currentUser.profilePicture.url}
                alt={currentUser.name || "User"}
                width={40}
                height={40}
                className={styles.replyProfileImage}
              />
            ) : (
              <div className={styles.replyProfilePlaceholder}>
                {currentUser?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className={styles.replyInputContainer}>
            <input
              type="text"
              placeholder="Post your reply"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className={styles.replyInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleReply()
                }
              }}
            />
            <button
              onClick={handleReply}
              disabled={!replyContent.trim() || isReplying}
              className={styles.replyButton}
            >
              Reply
            </button>
          </div>
        </div>
      </section>

      {/* BagianKomentar */}
      <section className={styles.repliesSection}>
        {replies.length > 0 ? (
          replies.map((reply) => (
            <TweetComponent 
              key={reply._id} 
              tweet={{
                ...reply,
                originalTweet: reply.originalTweet || undefined,
              } as any} 
            />
          ))
        ) : (
          <p className={styles.noReplies}>No replies yet.</p>
        )}
      </section>
    </main>
  )
}

export default PostDetailPage