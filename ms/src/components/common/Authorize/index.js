import React, { useState } from "react"

function Authorize() {
  const [username, setUsername] = useState("")

  const clientId = process.env.REACT_APP_MYANIMELIST_CLIENT_ID
  console.log(clientId)

  const pkceCodeChallenge = "47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU"

  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const url =
      "https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=" +
      clientId +
      "&code_challenge=" +
      pkceCodeChallenge +
      "&code_challenge_method=plain"

    window.open(url)
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
              <div
                id="usernameHelp"
                className="form-text text-color-white"
                style={{ color: "white" }}
              >
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
