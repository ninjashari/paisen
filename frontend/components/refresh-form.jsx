import Mal from "@/lib/mal"
import {
  getClientId,
  getUserRefreshToken,
  updateUserData,
} from "@/utils/userService"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState } from "react"
import FormLogo from "./form-logo"

const RefreshForm = () => {
  const router = useRouter()
  const contentType = "application/json"

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const handleTokenRefresh = async (e) => {
    e.preventDefault()

    const session = await getSession()
    if (session) {
      const currentRefreshToken = await getUserRefreshToken(session)
      if (currentRefreshToken) {
        const clientID = await getClientId()
        if (clientID) {
          const malObj = new Mal(clientID)
          console.log(currentRefreshToken)
          const response = await malObj.refreshAccessToken(currentRefreshToken)
          if (response) {
            console.log(response)
            // Create user data to be updated
            const userUpdateData = {
              username: session.user.username,
              tokenType: response.token_type,
              refreshToken: response.refresh_token,
              expiryTime: response.expires_in,
              accessToken: response.access_token,
            }

            console.log(userUpdateData)

            const res = updateUserData(userUpdateData)
            setShowAlert(true)
            if (res) {
              setAlertMessage(
                "Refresh token generated and user details updated"
              )
            } else {
              setAlertMessage("Couldn't update user data")
            }
          } else {
            setShowAlert(true)
            setAlertMessage(
              "Couldn't refresh access token. Some unknown error occured!!"
            )
          }
        }
      } else {
        alert("Couldn't get refresh token, Redirecting to authorise page!")
        router.replace("/authorise")
      }
    } else {
      alert("Couldn't get session, Redirecting to login page!")
      router.replace("/login")
    }
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  return (
    <main>
      <div className="container">
        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                <FormLogo />

                {showAlert ? (
                  <div
                    className="alert alert-warning alert-dismissible fade show"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    {alertMessage}
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="alert"
                      aria-label="Close"
                      onClick={closeAlert}
                    ></button>
                  </div>
                ) : (
                  ""
                )}

                <div className="card mb-3">
                  <div className="card-body">
                    <div className="pt-4 pb-2">
                      <h5 className="card-title text-center pb-0 fs-4">
                        Refresh MAL token
                      </h5>
                    </div>
                    <div className="col-12">
                      <button
                        className="btn btn-primary w-100"
                        type="button"
                        title="Click to refresh"
                        onClick={handleTokenRefresh}
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default RefreshForm
