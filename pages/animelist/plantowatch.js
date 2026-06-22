import AnimeListSkeleton from "@/components/anime-list-skeleton"
import AnimeListView from "@/components/anime-list-view"
import AppShell from "@/components/app-shell"
import ErrorState from "@/components/error-state"
import { userListStatus } from "@/utils/constants"
import { fetchAnimeList } from "@/utils/malClient"
import { getURILastValue } from "@/utils/uriService"
import { useRouter } from "next/router"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function AnimeListPage() {
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme("dark")
  }, [setTheme])

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState({ pageTitle: "", apiValue: "" })

  const load = async () => {
    const pageValue = getURILastValue(router.asPath)
    if (!pageValue || !userListStatus[pageValue]) return
    const m = userListStatus[pageValue]
    setMeta(m)
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAnimeList(m.apiValue)
      setData(list)
    } catch (err) {
      console.error("Failed to load anime list:", err)
      if (err.message === "Authentication required") return router.replace("/")
      if (err.message.startsWith("Authorize")) return router.replace("/authorise")
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (router.isReady) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath])

  return (
    <AppShell title={meta.pageTitle} subtitle="Your MyAnimeList, synced.">
      {loading ? (
        <AnimeListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <AnimeListView animeList={data} />
      )}
    </AppShell>
  )
}
