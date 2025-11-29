"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TweetComponent from "@/components/TweetComponent"

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
    <main className="text-white bg-black">
      <h1 className="p-4 text-xl font-bold border-b border-[#2f3336] sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        Home
      </h1>

      {loading ? (
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 p-4 border-b border-[#2f3336]">
              <div className="w-12 h-12 rounded-full bg-gray-700"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchTweets}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            Try again
          </button>
        </div>
      ) : tweets.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <p className="text-xl mb-2">No tweets yet</p>
          <p className="text-sm">Be the first to tweet!</p>
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
