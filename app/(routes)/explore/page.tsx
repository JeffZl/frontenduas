"use client"

import SearchComponent from "@/components/SearchComponent"
import SearchResult from "@/components/SearchResult"
import Trenditem from "@/components/TrendItem"
import { useEffect, useState } from "react"
import styles from "./style.module.css"

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
    <main className={`${styles.container}`}>
      <div className={`${styles.searchSection}`}>
        <SearchComponent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {searchQuery && (
        <div className={`${styles.searchResults}`}>
          {searching ? (
            <div className={styles.searchLoading}>
              {[1, 2].map((i) => (
                <div key={i} className={styles.searchLoadingItem}>
                  <div className={`${styles.avatarSkeleton}`} />
                  <div>
                    <div className={`${styles.textSkeleton} ${styles.skeletonSmall}`} />
                    <div className={`${styles.textSkeleton} ${styles.skeletonMedium}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className={`${styles.noResults}`}>
              <p className={styles.noResultsText}>No users found</p>
            </div>
          ) : (
            <div className={styles.searchResultsContent}>
              {searchResults.map((user, i) => (
                // limit nampilin 3 user aja
                i < 3 && <SearchResult key={user._id} user={user} mode="profile" />
              ))}
            </div>
          )}
        </div>
      )}

      <section className={styles.trendsSection}>
        <h2 className={styles.sectionTitle}>Trending Now</h2>
        {loading ? (
          <div className={styles.trendsLoading}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.trendSkeleton}>
                <div className={`${styles.topicSkeleton}`} />
                <div className={`${styles.titleSkeleton}`} />
                <div className={`${styles.countSkeleton}`} />
              </div>
            ))}
          </div>
        ) : trending.length === 0 ? (
          <div className={`${styles.noTrends}`}>
            <p className={styles.noTrendsText}>No trends available yet</p>
            <p className={styles.noTrendsSubtext}>Start using hashtags in your posts to see trends!</p>
          </div>
        ) : (
          <div className={styles.trendsList}>
            {trending.map(({ postCount, title, topic }, index) => (
              <Trenditem key={`${title}-${index}`} postCount={postCount} title={title} topic={topic} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}