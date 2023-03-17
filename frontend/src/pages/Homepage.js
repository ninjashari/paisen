import pkceChallenge from "pkce-challenge"
import React, { Component } from "react"
import { addUser } from "../utils/api"
import Mal from "../utils/mal"

class Homepage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      username: "",
    }
  }

  componentDidMount() {}

  handleUsernameChange = (event) => {
    this.setState({
      username: event.target.value,
    })
  }

  handleSubmit = async (event) => {
    event.preventDefault()

    const usernm = this.state.username

    if (usernm !== undefined && usernm !== "" && usernm.length > 0) {
      const pkce = pkceChallenge()

      //MAL client ID from env variables
      const clientId = process.env.REACT_APP_MYANIMELIST_CLIENT_ID

      const data = {
        username: usernm,
        code: "",
        codeChallenge: pkce.code_challenge,
        challengeVerifier: pkce.code_verifier,
      }

      const response = await addUser(data)

      if (response.username) {
        console.log("response authorized :: ", response)
        window.location.href = "http://localhost:3000/animelist"
      } else {
        const mal = new Mal(clientId)
        const url = mal.generateAuthorizeUrl(data.codeChallenge)
        window.location.href = url
      }
    }
  }

  render() {
    const { username } = this.state

    return (
      <>
        <div className="container" style={{ marginTop: "10rem" }}>
          <div className="row align-items-start">
            <div className="col"></div>
            <div className="col-4">
              <form onSubmit={this.handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    aria-describedby="usernameHelp"
                    value={username}
                    onChange={this.handleUsernameChange}
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
}

export default Homepage
