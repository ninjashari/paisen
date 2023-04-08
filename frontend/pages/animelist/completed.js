import Table from "@/components/animelist-table"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import MalApi from "@/lib/malApi"
import { getSession, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function Animelist() {
  const { data: session } = useSession()

  const [animeListData, setAnimeListData] = useState([])
  const [loading, setLoading] = useState(true)

  const fields = {
    animeList: [
      "id",
      "title",
      "main_picture",
      "alternative_titles",
      "start_date",
      "end_date",
      "synopsis",
      "mean",
      "rank",
      "popularity",
      "num_list_users",
      "num_scoring_users",
      "nsfw",
      "genres",
      "created_at",
      "updated_at",
      "media_type",
      "status",
      "my_list_status",
      "num_episodes",
      "start_season",
      "broadcast",
      "source",
      "average_episode_duration",
      "rating",
      "studios",
      "status",
      "score",
      "num_watched_episodes",
      "is_rewatching",
      "start_date",
      "finish_date",
      "priority",
      "num_times_rewatched",
      "rewatch_value",
      "tags",
      "updated_at",
    ],
  }

  useEffect(() => {
    getCurrentAnimeList()
  }, [])

  const getCurrentAnimeList = async () => {
    // Get user data
    const sessionA = await getSession()

    if (sessionA && sessionA.user) {
      const userResponse = await fetch("/api/user/" + sessionA.user.username)
      const userRes = await userResponse.json()
      const currentUserData = userRes.userData
      if (currentUserData && currentUserData.accessToken) {
        const malApi = new MalApi(currentUserData.accessToken)

        const resp = await malApi.getCompletedList(fields)
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
            {loading ? "" : <Table animeList={animeListData} />}
          </div>
        </section>
      </main>
    </>
  )
}
