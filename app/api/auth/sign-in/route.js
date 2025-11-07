import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request) {
  try {
    await connectToDB();
    const { email, password } = await request.json()

    if (!email || !password) return Response.json({ error: "Email and password are required" }, { status: 400 })

    const user = await User.findOne({ email })
    if (!user) return Response.json({ error: "Invalid email or password" }, { status: 401 })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return Response.json({ error: "Invalid email or password" }, { status: 401 })
    
    const token = jwt.sign(
      { id: user._id, email: user.email, handle: user.handle },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
        cookieStore.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });

    const userResponse = user.toObject()
    delete userResponse.password

    return Response.json({ message: "Sign-in successful", user: userResponse }, { status: 200 })
  } catch (error) {
    console.error("Error signing in:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
