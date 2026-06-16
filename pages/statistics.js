import AppShell from "@/components/app-shell"
import ErrorState from "@/components/error-state"
import Stats from "@/components/stats"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { fetchAnimeList } from "@/utils/malClient"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4">
              <div className="shimmer size-12 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="shimmer h-7 w-20 rounded-md" />
                <div className="shimmer h-4 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="shimmer h-6 w-40 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="shimmer h-[350px] w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  )
}

function Statistics() {
  const router = useRouter()

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
      if (err.message === "Authentication required") return router.replace("/")
      if (err.message.startsWith("Authorize")) return router.replace("/authorise")
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppShell title="Statistics" subtitle="Insights from your watchlist.">
      {loading ? (
        <StatsSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Stats animeList={animeListData} />
      )}
    </AppShell>
  )
}

export default Statistics
