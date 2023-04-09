import Table from "@/components/animelist-table"
import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import MalApi from "@/lib/malApi"
import { fields } from "@/utils/constants"
import { getSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function Animelist() {
  const [animeListData, setAnimeListData] = useState([])
  const [loading, setLoading] = useState(true)
  const [malAccessToken, setMalAccessToken] = useState()

  useEffect(() => {
    getAnimeList()
  }, [])

  const getAnimeList = async () => {
    // Get user data
    const session = await getSession()

    if (session && session.user) {
      const userResponse = await fetch("/api/user/" + session.user.username)
      const userRes = await userResponse.json()
      const currentUserData = userRes.userData
      if (currentUserData && currentUserData.accessToken) {
        setMalAccessToken(currentUserData.accessToken)
        const malApi = new MalApi(currentUserData.accessToken)

        const resp = await malApi.getAnimeList(fields, "on_hold")
        if (200 === resp.status) {
          const malData = resp.data
          setAnimeListData(malData.data)
          setLoading(false)
        } else {
          alert("Couldn't fetch anime list data from MAL")
        }
      } else {
        alert("Couldn't fetch local user data")
      }
    }
  }
  return (
    <>
      <Layout titleName="Animelist" />
      <Header />
      <Sidebar currentPage="animelist" />
      <main id="main" className="main">
        <Breadcrumb
          firstPage="Anime List"
          title="On Hold List"
          secondPage="On Hold"
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
