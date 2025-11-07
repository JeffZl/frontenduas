import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// create user
export async function POST(request) {
  try {
    await connectToDB()
    const data = await request.json()

    const { handle, email, password, name, bio, location, website } = data

    if (!handle || !email || !password) {
      return Response.json({ error: "Missing handle, email, or password please try again!" }, { status: 400 })
    }

    const existingUser = await User.findOne({
      $or: [{ handle }, { email }],
    });

    if (existingUser) {
      return Response.json({ error: "Handle or email already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      handle,
      email,
      password: hashedPassword,
      name,
      bio,
      location,
      website,
    });

    const userResponse = newUser.toObject()
    delete userResponse.password

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, handle: newUser.handle },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    cookies().set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    return Response.json(userResponse, { status: 201 })
  } catch (error) {
    console.error("Error creating User:", error)
    return Response.json({ error: "Failed to create User" }, { status: 500 })
  }
}