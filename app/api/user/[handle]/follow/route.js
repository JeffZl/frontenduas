import { connectToDB } from "@/lib/mongodb"
import User from "@/models/User"

// Follow or unfollow a user
export async function PATCH(request, { params }) {
  try {
    await connectToDB()

    const { handle } = await params
    const { currentUserId } = await request.json()

    if (!handle || !currentUserId) {
      return Response.json({ error: "Missing handle or user ID" }, { status: 400 })
    }

    const targetUser = await User.findOne({ handle })
    if (!targetUser) {
      return Response.json({ error: "Target user not found" }, { status: 404 })
    }

    // to prevent self follow
    if (targetUser._id.toString() === currentUserId) {
      return Response.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    // find cururent user
    const currentUser = await User.findById(currentUserId)
    if (!currentUser) {
      return Response.json({ error: "Current user not found" }, { status: 404 })
    }

    const isAlreadyFollowing = currentUser.following.includes(targetUser._id)

    if (isAlreadyFollowing) {
      // unfoll
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUser._id },
        $inc: { followingCount: -1 }
      })

      await User.findByIdAndUpdate(targetUser._id, {
        $pull: { followers: currentUser._id },
        $inc: { followersCount: -1 }
      })

      return Response.json({ message: `Unfollowed ${targetUser.handle}` }, { status: 200 })
    } else {
      // follow
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUser._id },
        $inc: { followingCount: 1 }
      })

      await User.findByIdAndUpdate(targetUser._id, {
        $addToSet: { followers: currentUser._id },
        $inc: { followersCount: 1 }
      })

      return Response.json({ message: `Followed ${targetUser.handle}` }, { status: 200 })
    }
  } catch (error) {
    console.error("Error following user:", error)
    return Response.json({ error: "Failed to follow user" }, { status: 500 })
  }
}