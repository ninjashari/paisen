import Mal from "@/lib/mal"
import { getQueryParams } from "@/utils/malService"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()
  const contentType = "application/json"

  useEffect(() => {
    // Store code to DB
    updateUserCodeAndToken()
  }, [])

  const updateUserCodeAndToken = async () => {
    try {
      // Get MAL client ID
      const res = await fetch("/api/mal/clientid")
      if (res.ok) {
        const resp = await res.json()
        if (resp && resp.data && resp.data.clientId) {
          const clientID = resp.data.clientId

          // Fetch user data
          const session = await getSession()

          const userResponse = await fetch("/api/user/" + session.user.username)

          const userRes = await userResponse.json()
          const currentUserData = userRes.userData
          const queryParams = getQueryParams(router.asPath.toString())
          const queryCode = queryParams.code

          // Create MAL service object
          const mal = new Mal(clientID)
          if (queryCode && currentUserData) {
            const response = await mal.generateAccessToken(
              queryCode,
              currentUserData.codeChallenge
            )

            if (response) {
              // Create user data to be updated
              const updateUserData = {
                username: session.user.username,
                code: queryCode,
                tokenType: response.token_type,
                refreshToken: response.refresh_token,
                expiryTime: response.expires_in,
                accessToken: response.access_token,
              }

              // Update user data
              const updateResponse = await fetch("/api/user/update", {
                method: "PUT",
                headers: {
                  Accept: contentType,
                  "Content-Type": contentType,
                },
                body: JSON.stringify(updateUserData),
              })

              if (updateResponse.ok) {
                router.replace("/")
              } else {
                alert("Couldn't update user data with token info")
              }
            } else {
              alert("Couldn't generate access token")
            }
          } else {
            alert("Couldn't get queryCode")
          }
        }
      }
    } catch (err) {
      alert(err)
    }
  }

  return (
    <>
      <main>
        <div className="container">
          <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
