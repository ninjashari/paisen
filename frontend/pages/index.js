import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function Home() {
  const { data: session } = useSession()

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
