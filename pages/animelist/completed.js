import Table from "@/components/animelist-table"
import AppLayout from "@/components/app-layout"
import ErrorState from "@/components/error-state"
import Loader from "@/components/loader"
import { userListStatus } from "@/utils/constants"
import { fetchAnimeList } from "@/utils/malClient"
import { getURILastValue } from "@/utils/uriService"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Animelist() {
  const router = useRouter()

  const [animeListData, setAnimeListData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageTitle, setPageTitle] = useState()

  const load = async () => {
    const pageValue = getURILastValue(router.asPath)
    if (!pageValue || !userListStatus[pageValue]) return

    setPageTitle(userListStatus[pageValue].pageTitle)
    setLoading(true)
    setError(null)

    try {
      const data = await fetchAnimeList(userListStatus[pageValue].apiValue)
      setAnimeListData(data)
    } catch (err) {
      console.error("Failed to load anime list:", err)
      if (err.message === "Authentication required") {
        router.replace("/")
        return
      }
      if (err.message.startsWith("Authorize")) {
        router.replace("/authorise")
        return
      }
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
    <AppLayout
      title={pageTitle}
      breadcrumb={{
        firstPage: "Anime List",
        title: pageTitle,
        secondPage: pageTitle,
      }}
    >
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Table animeList={animeListData} />
      )}
    </AppLayout>
  )
}
