import { connectToDB } from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const SECRET = process.env.JWT_SECRET

if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

// buat tau info current user
export async function GET() {
    try {
        await connectToDB()

        const cookieStore = await cookies()
        const token = cookieStore.get("session_token")?.value

        if (!token) {
            return Response.json({ error: "Not authenticated" }, { status: 401 })
        }

        let decoded
        try {
            decoded = jwt.verify(token, SECRET)
        } catch (err) {
            return Response.json({ error: "Invalid or expired token" }, { status: 403 })
        }

        const user = await User.findById(decoded.id)
            .select(
                "handle name bio profilePicture coverPicture email followersCount followingCount tweetsCount likesCount createdAt following"
            )
            .lean()

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 })
        }

        return Response.json({ user }, { status: 200 })
    } catch (error) {
        console.error("Error fetching current user:", error)
        return Response.json({ error: "Failed to fetch user" }, { status: 500 })
    }
    }
