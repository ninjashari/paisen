import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import FormLogo from "./form-logo"
import { hashPassword } from "@/utils/hash"

const RegisterForm = ({ userForm }) => {
  const router = useRouter()
  const contentType = "application/json"
  // User data form
  const [form, setForm] = useState({
    name: userForm.name,
    username: userForm.username,
    password: userForm.password,
  })

  const [confirmPassword, setConfirmPassword] = useState("")

  const [formClass, setFormClass] = useState("row g-3 needs-validation")

  const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState(
    "Please enter confirm password"
  )

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // When confirm password value is changed
  const handleConfirmPasswordChange = (e) => {
    const target = e.target
    const value = target.value

    if (value && value === form.password) {
      target.setCustomValidity("")
    } else if (value && value !== form.password) {
      target.setCustomValidity("Invalid confirm password")
      setConfirmPasswordErrorMsg("Confirm password should match password")
    } else {
      target.setCustomValidity("Invalid confirm password")
      setConfirmPasswordErrorMsg("Please enter confirm password")
    }

    setConfirmPassword(value)
  }

  // Handle form value changed
  const handleChange = (e) => {
    const target = e.target
    const value = target.value
    const name = target.name

    setForm({
      ...form,
      [name]: value,
    })

    setShowAlert(false)
  }

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    setFormClass("row g-3 was-validated")
    // setShowAlert(true)
    if (
      e.target.name.validity.valid &&
      e.target.username.validity.valid &&
      e.target.password.validity.valid &&
      e.target.confirmPassword.validity.valid
    ) {
      postData(form)
    }
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  // Call register API to save user data
  const postData = async (form) => {
    try {
      const hashPass = await hashPassword(form.password)

      const addUser = {
        name: form.name,
        username: form.username,
        password: hashPass,
      }

      // setConfirmPassword(form.password)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify(addUser),
      })

      if (res.ok) {
        router.push("/")
      } else {
        const response = await res.json()
        if (response.userExists) {
          setAlertMessage(response.message)
        } else {
          if (response.message) {
            setAlertMessage(response.message)
          } else {
            setAlertMessage("Failed to add user")
          }
        }
        setShowAlert(true)
      }
    } catch (error) {
      console.error(error)
      setAlertMessage("Failed to add user")
      setShowAlert(true)
    }
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
                        Create an Account
                      </h5>
                      <p className="text-center small">
                        Enter your personal details to create account
                      </p>
                    </div>
                    {/* needs-validation */}
                    {/* was-validated */}
                    <form
                      className={formClass}
                      noValidate
                      onSubmit={handleSubmit}
                    >
                      <div className="col-12">
                        <label className="form-label">Your Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={form.name}
                          onChange={handleChange}
                          pattern="^[A-Za-z][A-Za-z ]{0,48}[A-Za-z]$"
                          required
                        />
                        <div className="invalid-feedback">Enter name</div>
                      </div>

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
                            value={form.username}
                            onChange={handleChange}
                            required
                            pattern="^[A-Za-z][A-Za-z0-9_-]{7,31}$"
                          />
                          <div className="invalid-feedback">
                            <ul>
                              <li>Contain 8 to 32 characters</li>
                              <li>Starts with an alphabet</li>
                              <li>Username should be Alphanumeric</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={form.password}
                          onChange={handleChange}
                          required
                          pattern="^[A-Za-z0-9!@#$%^&*_=+-]{8,32}$"
                        />
                        <div className="invalid-feedback">
                          <ul>
                            <li>Minimum 8 characters required</li>
                            <li>Maximum 32 characters required</li>
                          </ul>
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control"
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          required
                        />
                        <div className="invalid-feedback">
                          {confirmPasswordErrorMsg}
                        </div>
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit">
                          Register
                        </button>
                      </div>
                      <div className="col-12">
                        <p className="small mb-0">
                          Already have an account?{" "}
                          <Link href="/login">Log in</Link>
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

export default RegisterForm
