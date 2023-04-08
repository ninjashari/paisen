import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import { getSession, useSession } from "next-auth/react"
import { useEffect } from "react"
import axios from "axios"

export default function Home() {
  const { data: session } = useSession()

  useEffect(() => {
    getMalUserData()
  }, [])

  const getMalUserData = async () => {
    // Get user data

    const sessionA = await getSession()

    const userResponse = await fetch("/api/user/" + sessionA.user.username)

    const userRes = await userResponse.json()
    const currentUserData = userRes.userData

    const url =
      "https://api.myanimelist.net/v2/users/" +
      currentUserData.malUsername +
      "?fields=anime_statistics"

    // const res = await fetch(
    //   "https://api.myanimelist.net/v2/users/" +
    //     currentUserData.malUsername +
    //     "?fields=anime_statistics",
    //   {
    //     headers: {
    //       Authorization:
    //         currentUserData.tokenType + " " + currentUserData.accessToken,
    //     },
    //   }
    // )

    console.log(res)
  }
  return (
    <>
      <Layout titleName="Paisen" />
      <Header />
      <Sidebar currentPage="home" />
      <main id="main" className="main">
        <Breadcrumb name="Home" />
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
