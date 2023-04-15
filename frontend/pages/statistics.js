import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import Stats from "@/components/stats"
import MalApi from "@/lib/malApi"
import { fields } from "@/utils/constants"
import { getUserAccessToken } from "@/utils/userService"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function Statistics() {
  const router = useRouter()
  const [animeListData, setAnimeListData] = useState([])
  const [loading, isLoading] = useState(true)

  useEffect(() => {
    isLoading(true)
    getAnimeList()
  }, [])

  const getAnimeList = async () => {
    const session = await getSession()
    if (session) {
      const accessToken = await getUserAccessToken(session)
      if (accessToken) {
        const malApi = new MalApi(accessToken)

        const resp = await malApi.getAnimeList(fields)
        if (200 === resp.status) {
          const malData = resp.data
          setAnimeListData(malData.data)
          isLoading(false)
        } else {
          alert("Couldn't fetch user anime list")
        }
      } else {
        alert("Couldn't retrieve access token from user. Authorise MAL user")
      }
    } else {
      router.replace("/")
    }
  }

  return (
    <>
      <Layout titleName="Statistics" />
      <Header />
      <Sidebar currentPage="statistics" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Statistics" title="Statistics" />
        <section className="section">
          {loading ? (
            <Loader />
          ) : (
            <Stats animeList={animeListData} isLoading={isLoading} />
          )}
        </section>
      </main>
    </>
  )
}

export default Statistics
