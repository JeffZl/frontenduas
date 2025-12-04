import { connectToDB } from "@/lib/mongodb"
import User from "@/models/User"
import Tweet from "@/models/Tweet"

export async function GET(req, { params }) {
  try {
    await connectToDB()

    const { handle } = await params

    if (!handle) {
      return Response.json({ error: "Missing handle parameter" }, { status: 400 })
    }

    const user = await User.findOne({ handle: handle.toLowerCase() })
      .select("_id handle")
      .lean()

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    const likedTweets = await Tweet.find({ likes: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "handle name profilePicture")
      .lean()

    return Response.json({ tweets: likedTweets }, { status: 200 })
  } catch (error) {
    console.error("Error fetching liked tweets:", error)
    return Response.json({ error: "Failed to fetch liked tweets" }, { status: 500 })
  }
}

