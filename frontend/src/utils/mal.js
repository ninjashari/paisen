import axios from "axios"
// import querystring from "querystring"

class Mal {
  baseUrl = "https://myanimelist.net/v1/oauth2"
  authorizeUrl = `${this.baseUrl}/authorize`
  accessTokenUrl = `${this.baseUrl}/token`

  constructor(clientId) {
    this.clientId = clientId

    axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded"
  }

  /**
   *
   * @param {String} codeChallenge
   * @returns URI for mal authorization
   */
  generateAuthorizeUrl(codeChallenge) {
    return `${this.authorizeUrl}?response_type=code&client_id=${this.clientId}&code_challenge=${codeChallenge}&code_challenge_method=plain`
  }
}

export default Mal
