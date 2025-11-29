import { connectToDB } from "@/lib/mongodb"
import Tweet from "@/models/Tweet"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

const normalizeAuthor = (author) => {
  if (!author) return null
  return {
    ...author,
    _id: author._id?.toString() || author._id,
  }
}

const formatTweet = (tweet) => {
  if (!tweet) return null

  return {
    ...tweet,
    _id: tweet._id?.toString() || tweet._id,
    author: normalizeAuthor(tweet.author),
    originalTweet: tweet.originalTweet
      ? {
        ...tweet.originalTweet,
        _id: tweet.originalTweet._id?.toString() || tweet.originalTweet._id,
        author: normalizeAuthor(tweet.originalTweet.author),
      }
      : null,
    parentTweet: tweet.parentTweet ? tweet.parentTweet.toString() : null,
    createdAt: tweet.createdAt,
    updatedAt: tweet.updatedAt,
  }
}

export async function GET(req, { params }) {
  try {
    await connectToDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return Response.json({ error: "Invalid or expired token" }, { status: 403 })
    }

    if (!decoded?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    if (!id) {
      return Response.json({ error: "Post id is required" }, { status: 400 })
    }

    const tweet = await Tweet.findOne({ _id: id, isDeleted: false })
      .populate("author", "handle name profilePicture")
      .populate({
        path: "originalTweet",
        populate: {
          path: "author",
          select: "handle name profilePicture",
        },
      })
      .lean()

    if (!tweet) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    const replies = await Tweet.find({ parentTweet: id, isDeleted: false })
      .populate("author", "handle name profilePicture")
      .populate({
        path: "originalTweet",
        populate: {
          path: "author",
          select: "handle name profilePicture",
        },
      })
      .sort({ createdAt: 1 })
      .lean()

    // Check if current user has liked/retweeted
    const userId = decoded.id.toString()
    const likesArray = Array.isArray(tweet.likes) ? tweet.likes : []
    const retweetsArray = Array.isArray(tweet.retweets) ? tweet.retweets : []
    const isLiked = likesArray.some((likeId: any) => likeId?.toString() === userId) || false
    const isRetweeted = retweetsArray.some((retweetId: any) => retweetId?.toString() === userId) || false

    return Response.json(
      {
        tweet: {
          ...formatTweet(tweet),
          isLiked,
          isRetweeted,
        },
        replies: replies.map(formatTweet),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching post details:", error)
    return Response.json({ error: "Failed to fetch post details" }, { status: 500 })
  }
}
