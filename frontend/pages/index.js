import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import MalApi from "@/lib/malApi"
import { getUserAccessToken, getUserRefreshToken } from "@/utils/userService"
import { getSession, useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const { data: session } = useSession()

  const [loading, isLoading] = useState(true)
  const [accessTokenValid, isAccessTokenValid] = useState(false)
  const [refreshTokenValid, isRefreshTokenValid] = useState(false)

  // MAL API Variables
  const fields = {
    user: ["anime_statistics"],
  }

  useEffect(() => {
    validateTokenData()
    // Get current session

    // Get access token

    // Check whether access token is working

    // Get current refreshToken

    // Generate new token, if refresh token missing or access token is invalid
  }, [])

  const validateTokenData = async () => {
    const session = await getSession()
    if (session) {
      const accessToken = await getUserAccessToken(session)
      if (accessToken) {
        const malObj = new MalApi(accessToken)
        const response = await malObj.getUserData(fields)
        const refreshToken = getUserRefreshToken(session)

        if (response && 200 === response.status) {
          isAccessTokenValid(true)

          if (refreshToken) {
            isRefreshTokenValid(true)
          } else {
            // Authorise
            isRefreshTokenValid(false)
          }
        } else {
          isAccessTokenValid(false)

          // Refresh access
          if (refreshToken) {
            isRefreshTokenValid(true)
          } else {
            // Authorise
            isRefreshTokenValid(false)
          }
        }
      }
    }
    isLoading(false)
  }

  return (
    <>
      <Layout titleName="Paisen" />
      <Header />
      <Sidebar currentPage="home" />
      {loading ? (
        <Loader />
      ) : (
        <main id="main" className="main">
          <Breadcrumb title="Home" />
          {session ? (
            <>
              <h1>
                Welcome, {session?.user?.name}!<br />
              </h1>
              {refreshTokenValid ? (
                <>
                  {accessTokenValid ? (
                    <h3>Access Token is Valid!</h3>
                  ) : (
                    <>
                      <h3>
                        <div className="col-12">
                          <p className="small mb-0">
                            <Link href="/refresh">Refresh</Link> mal account
                            token!
                          </p>
                        </div>
                      </h3>
                    </>
                  )}
                </>
              ) : (
                <h3>
                  <div className="col-12">
                    <p className="small mb-0">
                      <Link href="/authorise">Authorize</Link> your mal account!
                    </p>
                  </div>
                </h3>
              )}
            </>
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
      )}
    </>
  )
}
