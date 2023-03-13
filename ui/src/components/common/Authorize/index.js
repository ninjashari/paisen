import React, { useState } from "react"
import generateCodeChallenge from "../../../lib/CodeChallengeGenerator"

function Authorize() {
  const [username, setUsername] = useState("")
  const [pkceCodeChallenge, setPkceCodeChallenge] = useState("")

  const clientId = process.env.REACT_APP_MYANIMELIST_CLIENT_ID

  generateCodeChallenge(username)
    .then((codeChallenge) => {
      setPkceCodeChallenge(codeChallenge)
    })
    .catch((error) => {
      console.error(error)
    })

  console.log(pkceCodeChallenge)

  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const url =
      "https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=" +
      clientId +
      "&state=" +
      username +
      "&code_challenge=" +
      pkceCodeChallenge +
      "&code_challenge_method=plain"

    window.location.href = url
  }

  return (
    <div className="container" style={{ marginTop: "10rem" }}>
      <div className="row align-items-start">
        <div className="col"></div>
        <div className="col-4">
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                aria-describedby="usernameHelp"
                value={username}
                onChange={handleUsernameChange}
              />
              <label>Username</label>
              <div id="usernameHelp" className="form-text">
                Please enter username, not the email address.
              </div>
            </div>
            <button
              className="w-100 btn btn-lg btn-secondary mb-3"
              type="submit"
            >
              Authorize
            </button>
          </form>
        </div>
        <div className="col"></div>
      </div>
    </div>
  )
}

export default Authorize
