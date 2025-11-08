'use client'
import Image from "next/image"
import Link from "next/link"
import { FiHeart, FiMessageCircle, FiRepeat } from "react-icons/fi"

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
    profilePicture?: {
      url: string
    }
  }
  likesCount: number
  retweetsCount: number
  repliesCount: number
  createdAt: string
  originalTweet?: tweetInterface
}

const TweetComponent = ({ tweet }: { tweet: tweetInterface }) => {
    console.log(tweet)
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds}s`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
        
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return (
            <article
            key={tweet._id}
            className="p-4 border-b border-gray-300 dark:border-[#2f3336] hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors"
        >
            
            <div className="flex gap-3">
                <Link href={`/profile/${tweet.author.handle}`}>
                    {tweet.author.profilePicture?.url ? (
                            <Image
                                src={tweet.author.profilePicture.url}
                                alt={tweet.author.name}
                                width={48}
                                height={48}
                                className="rounded-full object-cover shrink-0 cursor-pointer"
                            />
                        ) : (
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 shrink-0 cursor-pointer">
                                <span className="text-black dark:text-white font-bold text-lg">
                                {tweet.author.name?.[0]?.toUpperCase() || "?"}
                                </span>
                            </div>
                    )}
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/profile/${tweet.author.handle}`}>
                            <span className="font-bold text-black dark:text-white hover:underline">
                            {tweet.author.name}
                            </span>
                        </Link>
                        <span className="text-gray-500 dark:text-gray-400">
                            @{tweet.author.handle}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">·</span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {formatTime(tweet.createdAt)}
                        </span>
                    </div>

                    {tweet.content && (
                        <p className="text-black dark:text-white mb-3 whitespace-pre-wrap wrap-break-words">
                            {tweet.content}
                        </p>
                    )}

                    {tweet.media && tweet.media.length > 0 && (
                        <div className="mb-3 rounded-2xl overflow-hidden">
                            {tweet.media.length === 1 ? (
                                <div className="relative">
                                    {tweet.media[0].mediaType === "video" ? (
                                        <video
                                            src={tweet.media[0].url}
                                            controls
                                            className="w-full max-h-[500px] object-contain bg-black"
                                            poster={tweet.media[0].thumbnail}
                                        />
                                    ) : (
                                        <Image
                                            src={tweet.media[0].url}
                                            alt={tweet.media[0].altText || "Tweet media"}
                                            width={600}
                                            height={400}
                                            className="w-full h-auto object-contain"
                                        />
                                    )}
                            </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-1">
                                    {tweet.media.slice(0, 4).map((media, idx) => (
                                    <div key={idx} className="relative aspect-square">
                                        {media.mediaType === "video" ? (
                                            <video
                                                src={media.url}
                                                controls
                                                className="w-full h-full object-cover"
                                                poster={media.thumbnail}
                                            />
                                        ) : (
                                            <Image
                                                src={media.url}
                                                alt={media.altText || `Media ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    ))}
                                </div>
                                )}
                            </div>
                        )}

                    <div className="flex items-center gap-8 mt-3 text-gray-500 dark:text-gray-400 justify-between max-w-md">
                        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <FiMessageCircle className="w-5 h-5" />
                            <span className="text-sm">{tweet.repliesCount || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                            <FiRepeat className="w-5 h-5" />
                            <span className="text-sm">{tweet.retweetsCount || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                            <FiHeart className="w-5 h-5" />
                            <span className="text-sm">{tweet.likesCount || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default TweetComponent