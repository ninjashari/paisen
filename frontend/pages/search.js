import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import MalApi from "@/lib/malApi"
import { getUserAccessToken } from "@/utils/userService"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function Search() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAnimeList()
  }, [])

  const getAnimeList = async () => {
    const session = await getSession()
    if (session) {
      const accessToken = await getUserAccessToken(session)
      if (accessToken) {
        const malApi = new MalApi(accessToken)

        const resp = await malApi.getSearchAnimeList("Blue Lock")
        if (200 === resp.status) {
          setLoading(false)
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
      <Layout titleName="Search" />
      <Header />
      <Sidebar currentPage="search" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Search" title="Search" />
        {loading ? (
          <Loader />
        ) : (
          <>
            <h3>Searched Data Table</h3> <table></table>
          </>
        )}
      </main>
    </>
  )
}

export default Search
