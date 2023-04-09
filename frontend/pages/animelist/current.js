import Table from "@/components/animelist-table"
import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import MalApi from "@/lib/malApi"
import { fields, userListStatus } from "@/utils/constants"
import { getURILastValue } from "@/utils/uriService"
import { getUserAccessToken } from "@/utils/userService"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Animelist() {
  const router = useRouter()

  const [animeListData, setAnimeListData] = useState([])
  const [loading, setLoading] = useState(true)
  const [malAccessToken, setMalAccessToken] = useState()
  const [pageTitle, setPageTitle] = useState()
  const [currentPageValue, setCurrentPageValue] = useState()

  useEffect(() => {
    setLoading(true)
    const pageValue = getURILastValue(router.asPath)
    if (pageValue) {
      const pageTitleValue = userListStatus[pageValue].pageTitle
      const pageValueCurrent = userListStatus[pageValue].apiValue

      setPageTitle(pageTitleValue)
      setCurrentPageValue(pageValueCurrent)

      getAnimeList()
    }
  }, [pageTitle, currentPageValue])

  const getAnimeList = async () => {
    const session = await getSession()
    if (session) {
      const accessToken = await getUserAccessToken(session)
      if (accessToken) {
        setMalAccessToken(accessToken)

        const malApi = new MalApi(accessToken)

        if (currentPageValue) {
          const resp = await malApi.getAnimeList(fields, currentPageValue)
          if (200 === resp.status) {
            const malData = resp.data
            setAnimeListData(malData.data)
            setLoading(false)
          }
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
      <Layout titleName={pageTitle} />
      <Header />
      <Sidebar />
      <main id="main" className="main">
        <Breadcrumb
          firstPage="Anime List"
          title={pageTitle}
          secondPage={pageTitle}
        />
        <section className="section">
          <div className="row">
            {loading ? (
              <Loader />
            ) : (
              <Table
                animeList={animeListData}
                malAccessToken={malAccessToken}
              />
            )}
          </div>
        </section>
      </main>
    </>
  )
}
