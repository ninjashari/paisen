import Link from "next/link"
import { useEffect, useState } from "react"
import FormLogo from "./form-logo"

const RegisterForm = () => {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  // const [confirmPassword, setConfirmPassword] = useState("")
  const [nameToolTip, setNameToolTip] = useState("")
  const [usernameToolTip, setUsernameToolTip] = useState("")
  const [passwordToolTip, setPasswordToolTip] = useState("")
  // const [confirmPasswordToolTip, setConfirmPasswordToolTip] = useState("")
  // const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState("")
  const [successful, isSuccessful] = useState(false)
  const [loading, isLoading] = useState(false)

  const onChangeName = (event) => {
    const name = event.target.value
    setName(name)
  }

  const onChangeUsername = (event) => {
    const username = event.target.value
    setUsername(username)
  }

  const onChangePassword = (event) => {
    const password = event.target.value
    setPassword(password)
  }

  // const onChangeConfirmPassword = (event) => {
  //   const confirmPassword = event.target.value
  //   setConfirmPassword(confirmPassword)
  //   if (
  //     password !== undefined &&
  //     password !== "" &&
  //     password !== confirmPassword
  //   ) {
  //     setConfirmPasswordErrorMsg("Passwords do not match")
  //   } else {
  //     setConfirmPasswordErrorMsg(
  //       "Please enter confirm password same as password"
  //     )
  //   }
  // }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (
      name !== undefined &&
      username !== undefined &&
      password != undefined &&
      name !== "" &&
      username !== "" &&
      password != ""
    ) {
      isLoading(true)
      // const encryptPassword = sha256(password).toString()

      const data = {
        name: name,
        username: username,
        password: password,
      }

      console.log(data)

      const res = await fetch("/api/user/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      console.log(res)
    }
  }

  useEffect(() => {
    setNameToolTip("Please enter your name")
    setUsernameToolTip("Please enter a valid username")
    setPasswordToolTip("Please enter a valid password")
    // setConfirmPasswordToolTip("Please enter same password as above")
  }, [])

  return (
    <main>
      <div className="container">
        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                <FormLogo />

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

                    <form
                      className="row g-3 needs-validation"
                      noValidate
                      onSubmit={handleSubmit}
                    >
                      <div className="col-12">
                        <label htmlFor="yourName" className="form-label">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          id="yourName"
                          value={name}
                          onChange={onChangeName}
                          required
                          pattern="^[A-Za-z][A-Za-z ]{1,48}[A-Za-z]$"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={nameToolTip}
                        />
                        <div className="invalid-feedback">
                          <ul>
                            <li>May contain upto 50 characters</li>
                            <li>Only alphabets and space allowed</li>
                          </ul>
                        </div>
                      </div>

                      <div className="col-12">
                        <label htmlFor="yourUsername" className="form-label">
                          Username
                        </label>
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
                            id="yourUsername"
                            value={username}
                            onChange={onChangeUsername}
                            required
                            pattern="^[A-Za-z][A-Za-z0-9_]{7,31}$"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={usernameToolTip}
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
                        <label htmlFor="yourPassword" className="form-label">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          id="yourPassword"
                          value={password}
                          onChange={onChangePassword}
                          required
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={passwordToolTip}
                          pattern="^[A-Za-z0-9!@#$%^&*_=+-]{8,}$"
                        />
                        <div className="invalid-feedback">
                          <ul>
                            <li>Minimum 8 characters required</li>
                          </ul>
                        </div>
                      </div>

                      {/* <div className="col-12">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={onChangeConfirmPassword}
                          required
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={confirmPasswordToolTip}
                        />
                        <div className="invalid-feedback">
                          <ul>
                            <li>{confirmPasswordErrorMsg}</li>
                          </ul>
                        </div>
                      </div> */}

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
