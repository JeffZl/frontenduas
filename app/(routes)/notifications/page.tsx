"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import "./notifications.css"

interface Notification {
  _id: string
  type: "message"
  content: string
  senderName: string
  senderHandle: string
  senderAvatar?: string
  conversationId?: string
  time: string
  read: boolean
}

interface Conversation {
  _id: string
  participant: {
    _id: string
    handle: string
    name: string
    profilePicture?: {
      url: string
    }
  }
  lastMessage?: {
    _id: string
    content: string
    sender: {
      _id: string
      handle: string
      name: string
    }
    createdAt: string
  }
  lastMessageAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ _id: string; handle: string } | null>(null)
  const router = useRouter()
  const seenNotificationIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const initialize = async () => {
      await fetchCurrentUser()
      // Wait a bit for currentUser to be set
      setTimeout(() => {
        fetchNotifications()
      }, 100)
    }
    
    initialize()
    
    // Poll untuk update notifications setiap 5 detik
    const interval = setInterval(() => {
      fetchNotifications(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Re-fetch notifications when currentUser is available
  useEffect(() => {
    if (currentUser) {
      fetchNotifications()
    }
  }, [currentUser])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/user/me", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const fetchNotifications = async (silent = false) => {
    try {
      const res = await fetch("/api/conversations", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        const conversations: Conversation[] = data.conversations || []
        
        if (!currentUser) return
        
        // Convert conversations dengan unread messages menjadi notifications
        const newNotifications: Notification[] = []
        
        conversations.forEach(conv => {
          // Hanya ambil conversation yang punya last message dan bukan dari current user
          if (!conv.lastMessage) return
          
          // Pastikan perbandingan ID benar (handle string comparison)
          // Convert both IDs to strings safely
          const senderId = conv.lastMessage.sender._id?.toString?.() || conv.lastMessage.sender._id;
          const userId = currentUser._id?.toString?.() || currentUser._id;

          
          if (senderId === userId) return // Skip pesan dari current user
          
          const notificationId = `msg-${conv._id}-${conv.lastMessage._id}`
          
          // Hanya tambahkan jika belum pernah muncul sebelumnya
          if (!seenNotificationIds.current.has(notificationId)) {
            seenNotificationIds.current.add(notificationId)
            newNotifications.push({
              _id: notificationId,
              type: "message" as const,
              content: `${conv.participant.name} mengirimkan kamu pesan baru`,
              senderName: conv.participant.name,
              senderHandle: conv.participant.handle,
              senderAvatar: conv.participant.profilePicture?.url,
              conversationId: conv._id,
              time: formatTime(conv.lastMessageAt),
              read: false,
            })
          }
        })
        
        // Tambahkan notifications baru ke state (jangan replace semua)
        if (newNotifications.length > 0) {
          setNotifications(prev => {
            // Gabungkan dengan notifications yang sudah ada, hindari duplikat
            const existingIds = new Set(prev.map(n => n._id))
            const uniqueNew = newNotifications.filter(n => !existingIds.has(n._id))
            const combined = [...prev, ...uniqueNew]
            
            // Sort by time (newest first)
            return combined.sort((a, b) => {
              const timeA = getTimeValue(a.time)
              const timeB = getTimeValue(b.time)
              return timeB - timeA
            })
          })
        }
      }
    } catch (error) {
      if (!silent) {
        console.error("Error fetching notifications:", error)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getTimeValue = (timeStr: string): number => {
    if (timeStr === "now") return Date.now()
    const match = timeStr.match(/(\d+)([mhd])/)
    if (!match) return 0
    
    const value = parseInt(match[1])
    const unit = match[2]
    const now = Date.now()
    
    if (unit === "m") return now - value * 60000
    if (unit === "h") return now - value * 3600000
    if (unit === "d") return now - value * 86400000
    return 0
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n._id === notification._id ? { ...n, read: true } : n
      )
    )

    // Redirect to messages
    if (notification.conversationId) {
      router.push(`/messages`)
      // TODO: Open specific conversation when viewing messages
    }
  }

  const getInitial = (name?: string) => {
    return name?.[0]?.toUpperCase() || "?"
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="notifications-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="notification-skeleton">
                <div className="notification-skeleton-icon" />
                <div className="notification-skeleton-content">
                  <div className="notification-skeleton-line" />
                  <div className="notification-skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <p>No notifications yet</p>
            <p className="notifications-empty-subtext">You&apos;ll see notifications here when someone messages you</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification ${notification.read ? "" : "unread"}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                💬
                {!notification.read && <span className="notif-dot"></span>}
              </div>
              <div className="notification-content">
                <div className="type">Pesan Baru</div>
                <div className="message">{notification.content}</div>
                <div className="time">{notification.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

