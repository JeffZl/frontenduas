import { connectToDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req, { params }) {
  try {
    await connectToDB()
    const { handle } = params

    if (!handle) {
      return Response.json({ error: "Missing handle parameter" }, { status: 400 })
    }

    const user = await User.findOne({ handle: handle.toLowerCase() })
      .select(
        "handle name bio profilePicture coverPicture followersCount followingCount tweetsCount likesCount createdAt"
      )
      .lean()

    if (!user) return Response.json({ error: "User not found" }, { status: 404 })

    return Response.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return Response.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDB()

    const body = await request.json()
    const { handle } = params

    if (!handle) return Response.json({ error: "Missing handle" }, { status: 400 })

    const allowedFields = [
      "name",
      "bio",
      "location",
      "website",
      "birthdate",
      "profilePicture",
      "coverPicture",
    ]

    const updates = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field]
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No valid fields provided for update" }, { status: 400 })
    }

    const updatedUser = await User.findOneAndUpdate(
      { handle: handle.toLowerCase() },
      { $set: updates },
      { new: true }
    ).select("-password")

    if (!updatedUser) return Response.json({ error: "User not found" }, { status: 404 })

    return Response.json({ message: "User updated successfully!", user: updatedUser }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDB()

    const { handle } = params

    if (!handle) return Response.json({ error: "Missing handle" }, { status: 400 })

    const user = await User.findOneAndDelete({ handle: handle.toLowerCase() })

    if (!user) return Response.json({ error: "User not found" }, { status: 404 })

    return Response.json({ message: "User deleted successfully!" }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }
}
