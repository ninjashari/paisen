import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function Home() {
  const { data: session } = useSession()

  return (
    <>
      <Layout titleName="Paisen" />
      <Header />
      <Sidebar currentPage="home" />
      <main id="main" className="main">
        <Breadcrumb title="Home" />
        {session ? (
          <h1>
            Welcome, {session?.user?.name}!<br />
          </h1>
        ) : (
          <>
            <h3>You are not Logged in!!</h3>
            <div className="col-12">
              <p className="small mb-0">
                Don't have account?{" "}
                <Link href="/register">Create an account</Link>
              </p>
            </div>
            <div className="col-12">
              <p className="small mb-0">
                Already have an account? <Link href="/login">Log in</Link>
              </p>
            </div>
          </>
        )}
      </main>
    </>
  )
}
