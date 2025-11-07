"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { IoMdArrowBack } from "react-icons/io";

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
  const [currentUser, setCurrentUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [searching, setSearching] = useState(false)
  const [showConversationsList, setShowConversationsList] = useState(true)

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

  // looping tiap 3 detik buat tau ada chat terbaru
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

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

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
    <div className="flex h-screen bg-black text-white relative">
      {/* main section buat list conversation */}
      <div
        className={`${
          showConversationsList ? "flex" : "hidden"
        } md:flex w-full md:w-96 border-r border-[#2f3336] flex-col absolute md:relative inset-0 z-10 md:z-auto bg-black`}
      >
        <div className="p-4 border-b border-[#2f3336]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">Messages</h1>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-white bg-[#202327] hover:bg-[#2f3336] rounded-full p-2 transition"
              title="Search users"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
          </div>
          {showSearch && (
            <div className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or handle..."
                className="w-full bg-[#202327] text-white px-4 py-2 rounded-full outline-none placeholder-gray-500 text-sm"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Search Results */}
        {showSearch && searchQuery && (
          <div className="border-b border-[#2f3336] max-h-96 overflow-y-auto">
            {searching ? (
              <div className="p-4 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="w-24 h-4 bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="w-32 h-3 bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="p-2">
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
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#0f0f0f] rounded-lg transition"
                  >
                    {user.profilePicture?.url ? (
                      <Image
                        src={user.profilePicture.url}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 shrink-0">
                        <span className="text-white font-bold text-sm">
                          {getInitial(user.name)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-bold truncate">{user.name}</div>
                      <div className="text-sm text-gray-500 truncate">@{user.handle}</div>
                      {user.bio && (
                        <div className="text-xs text-gray-600 truncate mt-1">{user.bio}</div>
                      )}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
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

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="w-32 h-3 bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start a conversation from a user's profile</p>
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
                className={`w-full flex items-center gap-3 p-3 md:p-4 hover:bg-[#0f0f0f] transition ${
                  selectedConversation?._id === conv._id ? "bg-[#0f0f0f]" : ""
                }`}
              >
                {conv.participant.profilePicture?.url ? (
                  <Image
                    src={conv.participant.profilePicture.url}
                    alt={conv.participant.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700 shrink-0">
                    <span className="text-white font-bold text-lg">
                      {getInitial(conv.participant.name)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold truncate">{conv.participant.name}</span>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage ? (
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage.sender.handle === currentUser?.handle
                        ? `You: ${conv.lastMessage.content}`
                        : conv.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No messages yet</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* right section message */}
      <div className="flex-1 flex flex-col w-full md:w-auto pb-20 md:pb-0">
        {selectedConversation ? (
          <>
            {/* header conversation */}
            <div className="p-3 md:p-4 border-b border-[#2f3336] flex items-center gap-3">
              {/* button buat balik di mobile */}
              <button
                onClick={() => {
                  setSelectedConversation(null)
                  setShowConversationsList(true)
                }}
                className="md:hidden text-white hover:bg-[#2f3336] rounded-full p-2 transition -ml-2"
                aria-label="Back to conversations"
              >
                <IoMdArrowBack className="w-5 h-5" />
              </button>
              {selectedConversation.participant.profilePicture?.url ? (
                <Image
                  src={selectedConversation.participant.profilePicture.url}
                  alt={selectedConversation.participant.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700">
                  <span className="text-white font-bold">
                    {getInitial(selectedConversation.participant.name)}
                  </span>
                </div>
              )}
              <div>
                <h2 className="font-bold">{selectedConversation.participant.name}</h2>
                <p className="text-sm text-gray-500">@{selectedConversation.participant.handle}</p>
              </div>
            </div>

            {/* section message sesama user */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 pb-24 md:pb-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender._id === currentUser?._id
                return (
                  <div
                    key={message._id}
                    className={`flex gap-3 ${isOwnMessage ? "justify-end" : ""}`}
                  >
                    {!isOwnMessage && (
                      <>
                        {message.sender.profilePicture?.url ? (
                          <Image
                            src={message.sender.profilePicture.url}
                            alt={message.sender.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 shrink-0">
                            <span className="text-white font-bold text-sm">
                              {getInitial(message.sender.name)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isOwnMessage ? "items-end" : ""}`}>
                      {!isOwnMessage && (
                        <span className="text-xs text-gray-500 mb-1">
                          {message.sender.name} · {formatTime(message.createdAt)}
                        </span>
                      )}
                      {isOwnMessage && (
                        <span className="text-xs text-gray-500 mb-1">
                          {formatTime(message.createdAt)}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? "bg-white text-black"
                            : "bg-[#202327] text-white"
                        }`}
                      >
                        <p className="text-[15px]">{message.content}</p>
                        {message.media && message.media.length > 0 && (
                          <div className="mt-2">
                            {message.media[0].mediaType === "image" && (
                              <Image
                                src={message.media[0].url}
                                alt="Message media"
                                width={300}
                                height={200}
                                className="rounded-lg object-cover"
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
              className="p-3 md:p-4 border-t border-[#2f3336] flex gap-2 md:gap-3 bg-black"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Start a message"
                className="flex-1 bg-[#202327] text-white px-3 md:px-4 py-2 rounded-full outline-none placeholder-gray-500 text-sm md:text-base"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sending}
                className="bg-white text-black font-bold px-4 md:px-6 py-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          // kalo belom ada message
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
            <div className="text-center">
              <p className="text-xl mb-2">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
