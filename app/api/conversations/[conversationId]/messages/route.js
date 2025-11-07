import { connectToDB } from "@/lib/mongodb"
import Conversation from "@/models/Conversation"
import Message from "@/models/Message"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET

// dapetin semua messages dalam satu conversation
export async function GET(request, { params }) {
  try {
    await connectToDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return Response.json({ error: "Invalid or expired token" }, { status: 403 })
    }

    const { conversationId } = await params

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (!conversation.participants.some((p) => p.toString() === decoded.id.toString())) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate({
        path: "sender",
        select: "handle name profilePicture",
      })
      .sort({ createdAt: 1 })
      .lean()

    return Response.json({ messages }, { status: 200 })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    await connectToDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return Response.json({ error: "Invalid or expired token" }, { status: 403 })
    }

    const { conversationId } = await params
    const { content, media } = await request.json()

    if (!content && (!media || media.length === 0)) {
      return Response.json({ error: "Message must contain content or media" }, { status: 400 })
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (!conversation.participants.some((p) => p.toString() === decoded.id.toString())) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const newMessage = await Message.create({
      conversation: conversationId,
      sender: decoded.id,
      content: content || "",
      media: media || [],
    })

    conversation.lastMessage = newMessage._id
    conversation.lastMessageAt = new Date()
    await conversation.save()

    const populatedMessage = await Message.findById(newMessage._id)
      .populate({
        path: "sender",
        select: "handle name profilePicture",
      })
      .lean()

    return Response.json({ message: populatedMessage }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return Response.json({ error: "Failed to send message" }, { status: 500 })
  }
}

