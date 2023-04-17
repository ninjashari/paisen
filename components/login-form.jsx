import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import FormLogo from "./form-logo"
import { signIn } from "next-auth/react"

const LoginForm = () => {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [formClass, setFormClass] = useState("row g-3 needs-validation")

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    await signIn("credentials", {
      redirect: false,
      username,
      password,
    })
      .then((res) => {
        if (!res.ok) {
          setAlertMessage("Username/Password invalid. Please try again")
          setShowAlert(true)
        } else {
          router.replace("/")
        }
      })
      .catch((err) => {
        console.error(err)
        setAlertMessage("Username/Password invalid. Please try again")
        setShowAlert(true)
      })
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
                        Login to Your Account
                      </h5>
                      <p className="text-center small">
                        Enter your username & password to login
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
                            required
                          />
                          <div className="invalid-feedback">
                            Please enter your username.
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <div className="invalid-feedback">
                          Please enter your password!
                        </div>
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit">
                          Login
                        </button>
                      </div>
                      <div className="col-12">
                        <p className="small mb-0">
                          Don't have account?{" "}
                          <Link href="/register">Create an account</Link>
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

export default LoginForm
