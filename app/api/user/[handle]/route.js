import { connectToDB } from "@/lib/mongodb"
import User from "@/models/User"
import Tweet from "@/models/Tweet"
import cloudinary from "@/lib/cloudinary"


export async function GET(req, { params }) {
  try {
    await connectToDB();

    const { handle } = await params;

    if (!handle) {
      return Response.json(
        { error: "Missing handle parameter" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ handle: handle.toLowerCase() })
      .select(
        "handle name bio profilePicture coverPicture location website birthdate followersCount followingCount tweetsCount likesCount createdAt tweets"
      )
      .lean();

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const tweets = await Tweet.find({ _id: { $in: user.tweets } })
      .sort({ createdAt: -1 }) // show most recent first
      .populate("author", "handle name profilePicture")
      .lean();

    return Response.json(
      { user: { ...user, tweets } },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return Response.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

async function uploadToCloudinary(base64, folder) {
  const uploadResponse = await cloudinary.uploader.upload(base64, {
    resource_type: "image",
    folder: folder,
  })

  return {
    url: uploadResponse.secure_url,
    publicId: uploadResponse.public_id,
    format: uploadResponse.format,
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDB()

    const body = await request.json()
    const { handle } = await params

    if (!handle) return Response.json({ error: "Missing handle" }, { status: 400 })

    const updates = {}

    // Handle text fields
    if (body.name !== undefined) updates.name = body.name
    if (body.bio !== undefined) updates.bio = body.bio
    if (body.location !== undefined) updates.location = body.location
    if (body.website !== undefined) updates.website = body.website
    if (body.birthdate !== undefined) updates.birthdate = body.birthdate

    // Handle profile picture upload
    if (body.profilePicture && body.profilePicture.base64) {
      try {
        const uploadResult = await uploadToCloudinary(body.profilePicture.base64, "profile_pictures")
        updates.profilePicture = uploadResult
      } catch (error) {
        console.error("Error uploading profile picture:", error)
        return Response.json({ error: "Failed to upload profile picture" }, { status: 500 })
      }
    }

    // Handle cover picture upload
    if (body.coverPicture && body.coverPicture.base64) {
      try {
        const uploadResult = await uploadToCloudinary(body.coverPicture.base64, "cover_pictures")
        updates.coverPicture = uploadResult
      } catch (error) {
        console.error("Error uploading cover picture:", error)
        return Response.json({ error: "Failed to upload cover picture" }, { status: 500 })
      }
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
