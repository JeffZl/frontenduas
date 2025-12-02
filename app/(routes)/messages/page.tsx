"use client"

import SearchComponent from "@/components/SearchComponent";
import SearchResult from "@/components/SearchResult";
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { FiSearch } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import "./messages.css";

import styles from "./style.module.css"

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
    <div className={styles.container}>
      {/* Conversations List Section */}
      <div
        className={`${styles.conversationsList} ${
          showConversationsList ? styles.show : styles.hide
        }`}
      >
        <div className={styles.conversationsHeader}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>Messages</h1>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={styles.searchButton}
              title="Search users"
            >
              <FiSearch className={styles.searchIcon} />
            </button>
          </div>
          {showSearch && (
            <SearchComponent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          )}
        </div>

        {/* Search Results */}
        {showSearch && searchQuery && (
          <div className={styles.searchResults}>
            {searching ? (
              <div className={styles.loadingSkeleton}>
                {[1, 2].map((i) => (
                  <div key={i} className={styles.skeletonItem}>
                    <div className={styles.skeletonAvatar} />
                    <div className={styles.skeletonText}>
                      <div className={styles.skeletonName} />
                      <div className={styles.skeletonHandle} />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className={styles.noResults}>
                <p>No users found</p>
              </div>
            ) : (
              <div className={styles.resultsList}>
                {searchResults.map((user, i) => (
                  i < 3 && <SearchResult key={user._id} user={user} mode="conversation" handleStartConversation={handleStartConversation} setShowConversationsList={setShowConversationsList} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.conversationsContent}>
          {loading ? (
            <div className={styles.loadingSkeleton}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.conversationSkeleton}>
                  <div className={styles.skeletonAvatarLarge} />
                  <div className={styles.skeletonText}>
                    <div className={styles.skeletonName} />
                    <div className={styles.skeletonMessage} />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No conversations yet</p>
              <p>Start a conversation from a user's profile</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => {
                  setSelectedConversation(conv)
                  if (window.innerWidth < 768) {
                    setShowConversationsList(false)
                  }
                }}
                className={`${styles.conversationItem} ${
                  selectedConversation?._id === conv._id ? styles.active : ""
                }`}
              >
                {conv.participant.profilePicture?.url ? (
                  <Image
                    src={conv.participant.profilePicture.url}
                    alt={conv.participant.name}
                    width={48}
                    height={48}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <span className={styles.avatarInitial}>
                      {getInitial(conv.participant.name)}
                    </span>
                  </div>
                )}
                <div className={styles.conversationInfo}>
                  <div className={styles.conversationHeader}>
                    <span className={styles.conversationName}>{conv.participant.name}</span>
                    {conv.lastMessage && (
                      <span className={styles.timeStamp}>
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage ? (
                    <p className={styles.lastMessage}>
                      {conv.lastMessage.sender.handle === currentUser?.handle
                        ? `You: ${conv.lastMessage.content}`
                        : conv.lastMessage.content}
                    </p>
                  ) : (
                    <p className={styles.lastMessage}>No messages yet</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className={styles.messagesSection}>
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className={styles.messagesHeader}>
              <button
                onClick={() => {
                  setSelectedConversation(null)
                  setShowConversationsList(true)
                }}
                className={styles.backButton}
                aria-label="Back to conversations"
              >
                <IoMdArrowBack className={styles.backIcon} />
              </button>
              {selectedConversation.participant.profilePicture?.url ? (
                <Image
                  src={selectedConversation.participant.profilePicture.url}
                  alt={selectedConversation.participant.name}
                  width={40}
                  height={40}
                  className={styles.messageAvatar}
                />
              ) : (
                <div className={styles.messageAvatarPlaceholder}>
                  <span className={styles.messageAvatarInitial}>
                    {getInitial(selectedConversation.participant.name)}
                  </span>
                </div>
              )}
              <div className={styles.messageUserInfo}>
                <h2 className={styles.messageUserName}>{selectedConversation.participant.name}</h2>
                <p className={styles.messageUserHandle}>@{selectedConversation.participant.handle}</p>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
              {messages.map((message) => {
                const isOwnMessage = message.sender._id === currentUser?._id
                return (
                  <div
                    key={message._id}
                    className={`${styles.messageWrapper} ${
                      isOwnMessage ? styles.ownMessage : ""
                    }`}
                  >
                    {!isOwnMessage && (
                      <>
                        {message.sender.profilePicture?.url ? (
                          <Image
                            src={message.sender.profilePicture.url}
                            alt={message.sender.name}
                            width={40}
                            height={40}
                            className={styles.messageAvatarSmall}
                          />
                        ) : (
                          <div className={styles.messageAvatarSmallPlaceholder}>
                            <span className={styles.messageAvatarSmallInitial}>
                              {getInitial(message.sender.name)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className={`${styles.messageContent} ${
                      isOwnMessage ? styles.ownMessageContent : ""
                    }`}>
                      {!isOwnMessage && (
                        <span className={styles.messageMeta}>
                          {message.sender.name} · {formatTime(message.createdAt)}
                        </span>
                      )}
                      {isOwnMessage && (
                        <span className={styles.messageMeta}>
                          {formatTime(message.createdAt)}
                        </span>
                      )}
                      <div
                        className={`${styles.messageBubble} ${
                          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
                        }`}
                      >
                        <p className={styles.messageText}>{message.content}</p>
                        {message.media && message.media.length > 0 && (
                          <div className={styles.messageMedia}>
                            {message.media[0].mediaType === "image" && (
                              <Image
                                src={message.media[0].url}
                                alt="Message media"
                                width={300}
                                height={200}
                                className={styles.mediaImage}
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

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className={styles.messageForm}
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Start a message"
                className={styles.messageInput}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sending}
                className={styles.sendButton}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          // Empty State
          <div className={styles.emptyMessages}>
            <div className={styles.emptyMessagesContent}>
              <p className={styles.emptyMessagesTitle}>Select a conversation</p>
              <p className={styles.emptyMessagesSubtitle}>Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
