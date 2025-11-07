import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET - Get user suggestions (users to follow)
export async function GET() {
  try {
    await connectToDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return Response.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    // Get current user's following list
    const currentUser = await User.findById(decoded.id).select("following");
    if (!currentUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get users that:
    // 1. Are not the current user
    // 2. Are not already being followed by current user
    // 3. Sort by followersCount (most popular first)
    // 4. Limit to 5 suggestions
    const excludeIds = [decoded.id, ...currentUser.following];
    
    const suggestions = await User.find({
      _id: { $nin: excludeIds }, // Not current user and not already following
    })
      .select("handle name profilePicture followersCount")
      .sort({ followersCount: -1 })
      .limit(5)
      .lean();

    // Format response
    const formattedSuggestions = suggestions.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      handle: user.handle,
      avatar: user.profilePicture?.url || null, // Only return avatar if profile picture exists
    }));

    return Response.json({ suggestions: formattedSuggestions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user suggestions:", error);
    return Response.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}

