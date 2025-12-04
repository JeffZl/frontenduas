"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TweetComponent from "@/components/TweetComponent"
import styles from "./page.module.css"

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

export default function HomePage() {
  const router = useRouter()
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTweets()
  }, [])

  const fetchTweets = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/tweets", {
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
    <main className={styles.main}>
      <h1 className={styles.header}>
        Home
      </h1>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.loadingItem}>
              <div className={styles.loadingAvatar}></div>
              <div className={styles.loadingContent}>
                <div className={styles.loadingLineShort}></div>
                <div className={styles.loadingLineLong}></div>
                <div className={styles.loadingLineMedium}></div>
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
        <div className={styles.emptyContainer}>
          <p className={styles.emptyTitle}>No tweets yet</p>
          <p className={styles.emptySubtitle}>Be the first to tweet!</p>
        </div>
      ) : (
        <div>
          {tweets.map((tweet) => (
            <TweetComponent key={tweet._id} tweet={tweet} />
          ))}
        </div>
      )}
    </main>
  )
}
