import Mal from "@/lib/mal"
import { getClientId, updateUserData } from "@/utils/userService"
import { getSession } from "next-auth/react"
import Link from "next/link"
import pkceChallenge from "pkce-challenge"
import { useState } from "react"
import FormLogo from "./form-logo"
import { useRouter } from "next/router"

const AuthoriseForm = () => {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [formClass, setFormClass] = useState("row g-3 needs-validation")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormClass("row g-3 was-validated")

    const session = await getSession()
    if (session) {
      if (e.target.username.validity.valid) {
        const pkce = pkceChallenge()
        const userUpdateData = {
          username: session.user.username,
          malUsername: username,
          codeChallenge: pkce.code_challenge,
        }

        const response = await updateUserData(userUpdateData)
        // console.log(response)
        if (response) {
          const clientID = await getClientId()
          if (clientID) {
            const mal = new Mal(clientID)

            const url = mal.generateAuthorizeUrl(userUpdateData.codeChallenge)
            // console.log(url)

            window.location.href = url
          } else {
            setShowAlert(true)
            setAlertMessage("Couldn't fetch MAL client ID")
          }
        } else {
          alert("Couldn't update user data")
        }
      } else {
        setShowAlert(true)
        setAlertMessage("Invalid username entered!!")
      }
    } else {
      alert("Couldn't fetch current session, Redirecting to login page!!")
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
                        Authorize myanimelist
                      </h5>
                      <p className="text-center small">
                        Enter your myanimelist username to authorize
                      </p>
                    </div>

                    <form
                      className={formClass}
                      noValidate
                      onSubmit={handleSubmit}
                    >
                      <div className="col-12">
                        <label className="form-label">Username</label>
                        <div className="input-group has-validation">
                          <span
                            className="input-group-text"
                            id="inputGroupPrepend"
                          >
                            @
                          </span>
                          <input
                            type="text"
                            name="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            pattern="^[A-Za-z][A-Za-z0-9_-]{1,15}$"
                            required
                          />
                          <div className="invalid-feedback">
                            Please enter your myanimelist username (not the
                            email id).
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit">
                          Authorize
                        </button>
                      </div>
                      <div className="col-12">
                        <p className="small mb-0">
                          Don't have MAL account?{" "}
                          <Link href="https://myanimelist.net/register.php">
                            Create MAL account
                          </Link>
                        </p>
                      </div>
                    </form>
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

export default AuthoriseForm
