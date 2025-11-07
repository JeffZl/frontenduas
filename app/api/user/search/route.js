import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET - Search users by handle or name
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length === 0) {
      return Response.json({ users: [] }, { status: 200 });
    }

    // Search by handle or name (case-insensitive)
    const searchRegex = new RegExp(query, "i");
    const users = await User.find({
      $and: [
        { _id: { $ne: decoded.id } }, // Exclude current user
        {
          $or: [
            { handle: searchRegex },
            { name: searchRegex },
          ],
        },
      ],
    })
      .select("handle name profilePicture bio")
      .limit(10)
      .lean();

    return Response.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return Response.json({ error: "Failed to search users" }, { status: 500 });
  }
}

