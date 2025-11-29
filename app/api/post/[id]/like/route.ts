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
    const isLiked = tweet.likes.includes(userId)

    if (isLiked) {
      // Unlike
      tweet.likes = tweet.likes.filter((likeId: any) => likeId.toString() !== userId)
      tweet.likesCount = Math.max(0, tweet.likesCount - 1)
      
      const user = await User.findById(userId)
      if (user) {
        user.likesCount = Math.max(0, user.likesCount - 1)
        await user.save()
      }
    } else {
      // Like
      tweet.likes.push(userId)
      tweet.likesCount += 1
      
      const user = await User.findById(userId)
      if (user) {
        user.likesCount += 1
        await user.save()
      }
    }

    await tweet.save()

    return Response.json(
      {
        message: isLiked ? "Post unliked" : "Post liked",
        likesCount: tweet.likesCount,
        isLiked: !isLiked,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error toggling like:", error)
    return Response.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}

