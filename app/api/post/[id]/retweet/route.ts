import { connectToDB } from "@/lib/mongodb"
import Tweet from "@/models/Tweet"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded: any
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

    const tweet = await Tweet.findById(id)
    if (!tweet) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    const userId = decoded.id
    const isRetweeted = tweet.retweets.includes(userId)

    if (isRetweeted) {
      // Unretweet
      tweet.retweets = tweet.retweets.filter((retweetId: any) => retweetId.toString() !== userId)
      tweet.retweetsCount = Math.max(0, tweet.retweetsCount - 1)
    } else {
      // Retweet
      tweet.retweets.push(userId)
      tweet.retweetsCount += 1
    }

    await tweet.save()

    return Response.json(
      {
        message: isRetweeted ? "Post unretweeted" : "Post retweeted",
        retweetsCount: tweet.retweetsCount,
        isRetweeted: !isRetweeted,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error toggling retweet:", error)
    return Response.json({ error: "Failed to toggle retweet" }, { status: 500 })
  }
}

