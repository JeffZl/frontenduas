"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { FiSearch } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import "./messages.css";

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

interface Message {
  _id: string
  sender: {
    _id: string
    handle: string
    name: string
    profilePicture?: {
      url: string
    }
  }
  content: string
  media?: Array<{
    url: string
    mediaType: string
  }>
  isRead: boolean
  createdAt: string
}

interface SearchUser {
  _id: string
  handle: string
  name: string
  profilePicture?: {
    url: string
  }
  bio?: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ _id: string; handle: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [searching, setSearching] = useState(false)
  const [showConversationsList, setShowConversationsList] = useState(true)
  const previousConversationsRef = useRef<Conversation[]>([])

  useEffect(() => {
    fetchCurrentUser()
    fetchConversations()

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowConversationsList(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id)

      // penanda buat kalau conversation dipilih jadi ke read semua
      markMessagesAsRead(selectedConversation._id)

      // sembunyiin chatbar kalau di mobile
      if (window.innerWidth < 768) {
        setShowConversationsList(false)
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    // kebawah kalo ada perubahan di state messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // looping tiap 3 detik buat tau ada chat terbaru di conversation yang dipilih
  useEffect(() => {
    if (!selectedConversation) return

    const interval = setInterval(() => {
      fetchMessages(selectedConversation._id, true)
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedConversation])

  // buat search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "now"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }


  const fetchConversations = useCallback(async (silent = false) => {
    try {
      const res = await fetch("/api/conversations", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        const newConversations = data.conversations || []

        setConversations(newConversations)
        previousConversationsRef.current = newConversations
      }
    } catch (error) {
      if (!silent) {
        console.error("Error fetching conversations:", error)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  // Poll untuk semua conversations untuk detect new messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true) // silent fetch
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [fetchConversations])

  // Poll untuk semua conversations untuk detect new messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true) // silent fetch
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [fetchConversations])

  const fetchMessages = async (conversationId: string, silent = false) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      if (!silent) {
        console.error("Error fetching messages:", error)
      }
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const res = await fetch(
        `/api/conversations/${selectedConversation._id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            content: messageInput.trim(),
          }),
        }
      )

      if (res.ok) {
        setMessageInput("")
        // Refresh messages and conversations
        await fetchMessages(selectedConversation._id)
        await fetchConversations()
      } else {
        console.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const getInitial = (name?: string) => {
    return name?.[0]?.toUpperCase() || "?"
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleStartConversation = async (userHandle: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ participantHandle: userHandle }),
      })

      if (res.ok) {
        const data = await res.json()
        const newConversation: Conversation = {
          _id: data.conversation._id,
          participant: data.conversation.participant,
          lastMessage: data.conversation.lastMessage,
          lastMessageAt: data.conversation.lastMessageAt,
        }
        setSelectedConversation(newConversation)

        await fetchConversations()

        setShowSearch(false)
        setSearchQuery("")
        setSearchResults([])
      } else {
        console.error("Failed to start conversation")
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  return (
    <div className="messages-container">
      {/* main section buat list conversation */}
      <div
        className={`conversations-section ${showConversationsList ? "show" : ""}`}
      >
        <div className="conversations-header">
          <div className="header-top">
            <h1 className="header-title">Messages</h1>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="search-button"
              title="Search users"
            >
              <FiSearch className="search-icon" />
            </button>
          </div>
          {showSearch && (
            <div className="search-input-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or handle..."
                className="search-input"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Search Results */}
        {showSearch && searchQuery && (
          <div className="search-results">
            {searching ? (
              <div className="search-loading">
                {[1, 2].map((i) => (
                  <div key={i} className="search-loading-item">
                    <div className="search-loading-avatar" />
                    <div className="search-loading-text">
                      <div className="search-loading-name" />
                      <div className="search-loading-handle" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="search-empty">
                <p className="search-empty-text">No users found</p>
              </div>
            ) : (
              <div className="search-results-list">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      handleStartConversation(user.handle)
                      // On mobile, hide conversations list when starting conversation
                      if (window.innerWidth < 768) {
                        setShowConversationsList(false)
                      }
                    }}
                    className="search-result-item"
                  >
                    {user.profilePicture?.url ? (
                      <Image
                        src={user.profilePicture.url}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="profile-image"
                      />
                    ) : (
                      <div className="profile-avatar">
                        <span className="profile-avatar-text">
                          {getInitial(user.name)}
                        </span>
                      </div>
                    )}
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-handle">@{user.handle}</div>
                      {user.bio && (
                        <div className="user-bio">{user.bio}</div>
                      )}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="add-icon"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="conversations-list">
          {loading ? (
            <div className="conversations-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="conversations-loading-item">
                  <div className="conversations-loading-avatar" />
                  <div className="search-loading-text">
                    <div className="search-loading-name" />
                    <div className="search-loading-handle" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="conversations-empty">
              <p>No conversations yet</p>
              <p className="conversations-empty-subtext">Start a conversation from a user&apos;s profile</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => {
                  setSelectedConversation(conv)
                  // On mobile, hide conversations list when selecting
                  if (window.innerWidth < 768) {
                    setShowConversationsList(false)
                  }
                }}
                className={`conversation-item ${selectedConversation?._id === conv._id ? "active" : ""}`}
              >
                {conv.participant.profilePicture?.url ? (
                  <Image
                    src={conv.participant.profilePicture.url}
                    alt={conv.participant.name}
                    width={48}
                    height={48}
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-avatar profile-avatar-large">
                    <span className="profile-avatar-text profile-avatar-large-text">
                      {getInitial(conv.participant.name)}
                    </span>
                  </div>
                )}
                <div className="user-info">
                  <div className="conversation-header-row">
                    <span className="user-name">{conv.participant.name}</span>
                    {conv.lastMessage && (
                      <span className="conversation-time">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage ? (
                    <p className="conversation-preview">
                      {conv.lastMessage.sender.handle === currentUser?.handle
                        ? `You: ${conv.lastMessage.content}`
                        : conv.lastMessage.content}
                    </p>
                  ) : (
                    <p className="conversation-preview">No messages yet</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* right section message */}
      <div className="messages-section">
        {selectedConversation ? (
          <>
            {/* header conversation */}
            <div className="message-header">
              {/* button buat balik di mobile */}
              <button
                onClick={() => {
                  setSelectedConversation(null)
                  setShowConversationsList(true)
                }}
                className="back-button"
                aria-label="Back to conversations"
              >
                <IoMdArrowBack className="back-icon" />
              </button>
              {selectedConversation.participant.profilePicture?.url ? (
                <Image
                  src={selectedConversation.participant.profilePicture.url}
                  alt={selectedConversation.participant.name}
                  width={40}
                  height={40}
                  className="profile-image"
                />
              ) : (
                <div className="profile-avatar">
                  <span className="profile-avatar-text">
                    {getInitial(selectedConversation.participant.name)}
                  </span>
                </div>
              )}
              <div className="message-header-info">
                <h2>{selectedConversation.participant.name}</h2>
                <p>@{selectedConversation.participant.handle}</p>
              </div>
            </div>

            {/* section message sesama user */}
            <div className="messages-list">
              {messages.map((message) => {
                const isOwnMessage = message.sender._id === currentUser?._id
                return (
                  <div
                    key={message._id}
                    className={`message-wrapper ${isOwnMessage ? "own" : ""}`}
                  >
                    {!isOwnMessage && (
                      <>
                        {message.sender.profilePicture?.url ? (
                          <Image
                            src={message.sender.profilePicture.url}
                            alt={message.sender.name}
                            width={40}
                            height={40}
                            className="profile-image"
                          />
                        ) : (
                          <div className="profile-avatar">
                            <span className="profile-avatar-text">
                              {getInitial(message.sender.name)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className={`message-content-wrapper ${isOwnMessage ? "own" : ""}`}>
                      {!isOwnMessage && (
                        <span className="message-meta">
                          {message.sender.name} · {formatTime(message.createdAt)}
                        </span>
                      )}
                      {isOwnMessage && (
                        <span className="message-meta">
                          {formatTime(message.createdAt)}
                        </span>
                      )}
                      <div className={`message-bubble ${isOwnMessage ? "own" : "other"}`}>
                        <p className="message-text">{message.content}</p>
                        {message.media && message.media.length > 0 && (
                          <div className="message-media">
                            {message.media[0].mediaType === "image" && (
                              <Image
                                src={message.media[0].url}
                                alt="Message media"
                                width={300}
                                height={200}
                                className="message-media-image"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* chat input */}
            <form
              onSubmit={handleSendMessage}
              className="message-form"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Start a message"
                className="message-input"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sending}
                className="send-button"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          // kalo belom ada message
          <div className="empty-state">
            <div className="empty-state-content">
              <p className="empty-state-title">Select a conversation</p>
              <p className="empty-state-text">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
