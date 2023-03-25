import React, { useState } from "react"
import { Form, InputGroup } from "react-bootstrap"

const required = (value) => {
  if (!value) {
    return (
      <div className="invalid-feedback d-block">This field is required!</div>
    )
  }
}

const vusername = (value) => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="invalid-feedback d-block">
        The username must be between 3 and 20 characters.
      </div>
    )
  }
}

const vpassword = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="invalid-feedback d-block">
        The password must be between 6 and 40 characters.
      </div>
    )
  }
}

const Register = (props) => {
  //   const form = useRef()
  //   const checkBtn = useRef()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [successful, setSuccessful] = useState(false)
  const [message, setMessage] = useState("")

  const onChangeUsername = (event) => {
    const username = event.target.value
    setUsername(username)
  }

  const onChangePassword = (event) => {
    const password = event.target.value
    setPassword(password)
  }

  const handleRegister = (event) => {
    event.preventDefault()

    setMessage("")
    setSuccessful(false)

    // form.current.validateAll()

    // if (checkBtn.current.context._errors.length === 0) {
    //   AuthService.register(username, email, password).then(
    //     (response) => {
    //       setMessage(response.data.message);
    //       setSuccessful(true);
    //     },
    //     (error) => {
    //       const resMessage =
    //         (error.response &&
    //           error.response.data &&
    //           error.response.data.message) ||
    //         error.message ||
    //         error.toString();

    setMessage("Message")
    setSuccessful(false)
    // }
    //   );
    // }
  }

  return (
    <Form onSubmit={handleRegister}>
      {!successful && (
        <div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <InputGroup
              type="text"
              className="form-control"
              name="username"
              value={username}
              onChange={onChangeUsername}
              validations={[required, vusername]}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <InputGroup
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={onChangePassword}
              validations={[required, vpassword]}
            />
          </div>

          <div className="form-group">
            <button className="btn btn-primary btn-block">Sign Up</button>
          </div>
        </div>
      )}

      {message && (
        <div className="form-group">
          <div
            className={
              successful ? "alert alert-success" : "alert alert-danger"
            }
            role="alert"
          >
            {message}
          </div>
        </div>
      )}
    </Form>
  )
}

export default Register
