import AppLayout from "@/components/app-layout"
import ErrorState from "@/components/error-state"
import Loader from "@/components/loader"
import Stats from "@/components/stats"
import { fetchAnimeList } from "@/utils/malClient"
import { useEffect, useState } from "react"

function Statistics() {
  const [animeListData, setAnimeListData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAnimeList(undefined, "statistics")
      setAnimeListData(data)
    } catch (err) {
      console.error("Failed to load statistics:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AppLayout
      title="Statistics"
      breadcrumb={{ firstPage: "Statistics", title: "Statistics" }}
    >
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Stats animeList={animeListData} isLoading={() => {}} />
      )}
    </AppLayout>
  )
}

export default Statistics
