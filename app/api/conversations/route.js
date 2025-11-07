import { connectToDB } from "@/lib/mongodb"
import Conversation from "@/models/Conversation"
import Message from "@/models/Message"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET

// get semua conversationnya user
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
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return Response.json({ error: "Invalid or expired token" }, { status: 403 })
    }

    const conversations = await Conversation.find({
      participants: decoded.id
    })
      .populate({
        path: "participants",
        select: "handle name profilePicture",
      })
      .populate({
        path: "lastMessage",
        select: "content sender createdAt",
        populate: {
          path: "sender",
          select: "handle name",
        },
      })
      .sort({ lastMessageAt: -1 })
      .lean()

    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== decoded.id.toString()
      )
      
      return {
        _id: conv._id,
        participant: otherParticipant || conv.participants[0],
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      }
    })

    return Response.json({ conversations: formattedConversations }, { status: 200 })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return Response.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

// bikin conversation baru
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

    const { participantHandle } = await request.json()

    if (!participantHandle) {
      return Response.json({ error: "Participant handle is required" }, { status: 400 })
    }

    const otherUser = await User.findOne({ handle: participantHandle.toLowerCase() })
    if (!otherUser) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    if (otherUser._id.toString() === decoded.id.toString()) {
      return Response.json({ error: "Cannot create conversation with yourself" }, { status: 400 })
    }

    const existingConversation = await Conversation.findOne({
      participants: { $all: [decoded.id, otherUser._id] },
    })
      .populate({
        path: "participants",
        select: "handle name profilePicture",
      })
      .lean()

    if (existingConversation) {
      const otherParticipant = existingConversation.participants.find(
        (p) => p._id.toString() !== decoded.id.toString()
      )
      
      return Response.json({
        conversation: {
          _id: existingConversation._id,
          participant: otherParticipant || existingConversation.participants[0],
          lastMessage: existingConversation.lastMessage,
          lastMessageAt: existingConversation.lastMessageAt,
          createdAt: existingConversation.createdAt,
        },
      }, { status: 200 })
    }

    const newConversation = await Conversation.create({
      participants: [decoded.id, otherUser._id],
    })

    const populatedConversation = await Conversation.findById(newConversation._id)
      .populate({
        path: "participants",
        select: "handle name profilePicture",
      })
      .lean()

    const otherParticipant = populatedConversation.participants.find(
      (p) => p._id.toString() !== decoded.id.toString()
    )

    return Response.json({
      conversation: {
        _id: populatedConversation._id,
        participant: otherParticipant || populatedConversation.participants[0],
        lastMessage: null,
        lastMessageAt: populatedConversation.lastMessageAt,
        createdAt: populatedConversation.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return Response.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}

