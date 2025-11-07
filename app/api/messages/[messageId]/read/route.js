import { connectToDB } from "@/lib/mongodb"
import Conversation from "@/models/Conversation"
import Message from "@/models/Message"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET

export async function PUT(request, { params }) {
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

    const { messageId } = await params

    const message = await Message.findById(messageId).populate({
      path: "conversation",
      select: "participants",
    })

    if (!message) {
      return Response.json({ error: "Message not found" }, { status: 404 })
    }

    const conversation = message.conversation
    if (!conversation.participants.some((p) => p.toString() === decoded.id.toString())) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (message.sender.toString() !== decoded.id.toString()) {
      message.isRead = true
      message.readAt = new Date()
      await message.save()
    }

    return Response.json({ message: "Message marked as read" }, { status: 200 })
  } catch (error) {
    console.error("Error marking message as read:", error)
    return Response.json({ error: "Failed to mark message as read" }, { status: 500 })
  }
}

export async function POST(request) {
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

    const { conversationId } = await request.json()

    if (!conversationId) {
      return Response.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (!conversation.participants.some((p) => p.toString() === decoded.id.toString())) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: decoded.id },
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    )

    return Response.json({ message: "Messages marked as read" }, { status: 200 })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return Response.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
}

