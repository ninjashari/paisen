import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import MalApi from "@/lib/malApi"
import { getSession, useSession } from "next-auth/react"
import { useEffect } from "react"

export default function Home() {
  const { data: session } = useSession()

  const fields = {
    user: [
      "id",
      "name",
      "picture",
      "gender",
      "birthday",
      "location",
      "joined_at",
      "anime_statistics",
      "time_zone",
      "is_supporter",
    ],
  }

  useEffect(() => {
    getMalUserData()
  }, [])

  const getMalUserData = async () => {
    // Get user data
    const sessionA = await getSession()

    if (sessionA && sessionA.user) {
      const userResponse = await fetch("/api/user/" + sessionA.user.username)
      const userRes = await userResponse.json()
      const currentUserData = userRes.userData
      if (currentUserData && currentUserData.accessToken) {
        const malApi = new MalApi(currentUserData.accessToken)

        const resp = await malApi.getUserData(fields)
        if (200 === resp.status) {
          const malData = resp.data
          console.log(malData)
        }
      }
    }
  }
  return (
    <>
      <Layout titleName="Paisen" />
      <Header />
      <Sidebar currentPage="home" />
      <main id="main" className="main">
        <Breadcrumb title="Home" />
        {session ? (
          <h1>
            Signed in as {session?.user?.name} <br />
          </h1>
        ) : (
          <h1>
            Not signed in <br />
          </h1>
        )}
      </main>
    </>
  )
}
