"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
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
    likesCount: number
    retweetsCount: number
    repliesCount: number
    createdAt: string
    originalTweet?: Tweet
}

const page = () => {
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
        <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white border-x border-gray-300 dark:border-[#2f3336]">
        <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm z-10 border-b border-gray-300 dark:border-[#2f3336]">
            <div className="flex items-center gap-4 p-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-full transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold">#{hashtag}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tweets.length} tweets
                    </p>
                </div>
            </div>
        </div>

        {/* Content */}
        {loading ? (
            <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                        <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            ))}
            </div>
        ) : error ? (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <button
                    onClick={fetchTweets}
                    className="text-blue-500 hover:underline"
                >
                    Try again
                </button>
            </div>
        ) : tweets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">No tweets found</p>
                <p className="text-sm">Be the first to tweet with #{hashtag}!</p>
            </div>
        ) : (
            <div>
                {tweets.map((tweetData) => ( <TweetComponent key={tweetData._id} tweet={tweetData} /> ))}
            </div>
        )}
        </main>
    )
}

export default page