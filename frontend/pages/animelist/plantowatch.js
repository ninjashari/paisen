import Table from "@/components/animelist-table"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import MalApi from "@/lib/malApi"
import { fields } from "@/utils/constants"
import { getSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function Animelist() {
  const [animeListData, setAnimeListData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnimeList()
  }, [])

  const getAnimeList = async () => {
    // Get user data
    const sessionA = await getSession()

    if (sessionA && sessionA.user) {
      const userResponse = await fetch("/api/user/" + sessionA.user.username)
      const userRes = await userResponse.json()
      const currentUserData = userRes.userData
      if (currentUserData && currentUserData.accessToken) {
        const malApi = new MalApi(currentUserData.accessToken)

        const resp = await malApi.getPlanToWatchList(fields)
        if (200 === resp.status) {
          const malData = resp.data
          setAnimeListData(malData.data)
          setLoading(false)
        }
      }
    }
  }
  return (
    <>
      <Layout titleName="Animelist" />
      <Header />
      <Sidebar currentPage="animelist" />
      <main id="main" className="main">
        <section className="section">
          <div className="row">
            {loading ? (
              <div className="container">
                <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <div className="container">
                    <div className="row justify-content-center">
                      <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <Table animeList={animeListData} />
            )}
          </div>
        </section>
      </main>
    </>
  )
}
