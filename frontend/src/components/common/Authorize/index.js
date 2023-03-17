import React, { useState } from "react"
import { addUser } from "../../../utils/api"
import {
  generateCodeChallenge,
  generateCodeVerifier
} from "../../../utils/pkceCodeChallenge"

function Authorize() {
  const [username, setUsername] = useState("")
  const [pkceCodeChallenge, setPkceCodeChallenge] = useState("")
  const [codeChallengeVerifier, setCodeChallengeVerifier] = useState("")

  const clientId = process.env.REACT_APP_MYANIMELIST_CLIENT_ID

  // Generation of code verifier and code challenge
  const codeVerifier = generateCodeVerifier()
  generateCodeChallenge(codeVerifier)
    .then((codeChallenge) => {
      setPkceCodeChallenge(codeChallenge)
      setCodeChallengeVerifier(codeVerifier)
    })
    .catch((error) => {
      console.error(error)
    })

  // Change username value when typing
  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (username !== undefined && username !== "" && username.length > 0) {
      // Call register API to save username, pkceCodeChallenge and codeVerifier
      const response = await addUser(
        username,
        "",
        pkceCodeChallenge,
        codeChallengeVerifier
      )

      if (response.username) {
        console.log("response authorized :: ", response)
        window.location.href = "http://localhost:3000/animelist"
      } else {
        // Set redirect URL
        const url =
          "https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=" +
          clientId +
          "&state=" +
          username +
          "&code_challenge=" +
          pkceCodeChallenge +
          "&code_challenge_method=plain"
        // Open myanimelist authorize url
        window.location.href = url
      }
    } else {
      alert("please type username")
    }
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
                required
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
