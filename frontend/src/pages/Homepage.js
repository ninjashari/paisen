import pkceChallenge from "pkce-challenge"
import React, { useState, useEffect } from "react"
import { addUser } from "../utils/api"
import Mal from "../utils/mal"

function Homepage() {
  const [username, setUsername] = useState("")

  // Session Key for username
  const USERNAME = "USERNAME"

  useEffect(() => {
    sessionStorage.setItem(USERNAME, username)
  })

  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const usernm = username

      if (usernm !== undefined && usernm !== "" && usernm.length > 0) {
        const pkce = pkceChallenge()

        //MAL client ID from env variables
        const clientId = process.env.REACT_APP_MYANIMELIST_CLIENT_ID

        const data = {
          username: usernm,
          code: "",
          codeChallenge: pkce.code_challenge,
          challengeVerifier: pkce.code_challenge,
        }

        const response = await addUser(data)

        if (response.username) {
          window.location.href = "http://localhost:3000/animelist"
        } else {
          const mal = new Mal(clientId)
          const url = mal.generateAuthorizeUrl(data.codeChallenge)
          window.location.href = url
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
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
    </>
  )
}

export default Homepage
