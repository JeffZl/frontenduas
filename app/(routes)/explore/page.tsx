"use client"

import SearchComponent from "@/components/SearchComponent"
import SearchResult from "@/components/SearchResult"
import Trenditem from "@/components/TrendItem"
import { useEffect, useState } from "react"

interface Trend {
  topic: string,
  title: string,
  postCount: string
}

export default function FeedPage() {
  const [trending, setTrending] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch("/api/trends", {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setTrending(data.trends || [])
        }
      } catch (error) {
        console.error("Error fetching trends:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [])

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



  return (
    <main className="min-h-screen bg-white dark:bg-black text-dark dark:text-white border-x border-gray-300 dark:border-[#2f3336] p-4">
      <div className="p-4 border-b border-gray-300 dark:border-[#2f3336]">
        <SearchComponent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {searchQuery && (
        <div className="border-b border-gray-300 dark:border-[#2f3336] max-h-96 overflow-y-auto">
          {searching ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="w-32 h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="p-2">
              {searchResults.map((user, i) => (
                // limit nampilin 3 user aja
                i < 3 && <SearchResult key={user._id} user={user} mode="profile" />
              ))}
            </div>
          )}
        </div>
      )}

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Trending Now</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-[#202327] animate-pulse">
                <div className="w-24 h-3 bg-gray-700 rounded mb-2" />
                <div className="w-32 h-4 bg-gray-700 rounded mb-2" />
                <div className="w-20 h-3 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : trending.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>No trends available yet</p>
            <p className="text-sm mt-2">Start using hashtags in your posts to see trends!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trending.map(({ postCount, title, topic }, index) => (
              <Trenditem key={`${title}-${index}`} postCount={postCount} title={title} topic={topic} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
