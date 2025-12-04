import { connectToDB } from "@/lib/mongodb"
import Tweet from "@/models/Tweet"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export async function GET(req, { params }) {
  try {
    await connectToDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return Response.json({ error: "Invalid or expired token" }, { status: 403 })
    }

    const { hashtag } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const normalizedHashtag = hashtag.replace(/^#/, '').toLowerCase()

    const tweets = await Tweet.find({
      hashtags: { $regex: new RegExp(`^#?${normalizedHashtag}$`, "i") },
      isDeleted: false,
      parentTweet: null
    })
      .populate("author", "handle name profilePicture")
      .populate({
        path: "originalTweet",
        populate: {
          path: "author",
          select: "handle name profilePicture"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalCount = await Tweet.countDocuments({
      hashtags: { $regex: new RegExp(`^#?${normalizedHashtag}$`, "i") },
      isDeleted: false,
      parentTweet: null
    })

    const formattedTweets = tweets.map(tweet => {
      if (tweet.originalTweet && typeof tweet.originalTweet === 'object') {
        return {
          ...tweet,
          _id: tweet._id.toString(),
          author: {
            ...tweet.author,
            _id: tweet.author._id.toString()
          },
          originalTweet: {
            ...tweet.originalTweet,
            _id: tweet.originalTweet._id.toString(),
            author: tweet.originalTweet.author ? {
              ...tweet.originalTweet.author,
              _id: tweet.originalTweet.author._id.toString()
            } : null
          },
          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt
        }
      }
      return {
        ...tweet,
        _id: tweet._id.toString(),
        author: {
          ...tweet.author,
          _id: tweet.author._id.toString()
        },
        createdAt: tweet.createdAt,
        updatedAt: tweet.updatedAt
      }
    })

    return Response.json({
      tweets: formattedTweets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, { status: 200 })
  } catch (err) {
    console.error("Error fetching tweets by hashtag:", err)
    return Response.json({ error: "Failed to fetch tweets" }, { status: 500 })
  }
}