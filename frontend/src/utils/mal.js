import axios from "axios"
import querystring from "querystring"

class Mal {
  baseUrl = "https://myanimelist.net/v1/oauth2"
  authorizeUrl = `${this.baseUrl}/authorize`
  accessTokenUrl = `${this.baseUrl}/token`

  constructor(clientId) {
    this.clientId = clientId

    axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded"
    axios.defaults.headers["Host"] = "http://localhost:3000/oauth"
  }

  /**
   *
   * @param {String} codeChallenge
   * @returns URI for mal authorization
   */
  generateAuthorizeUrl(codeChallenge) {
    return `${this.authorizeUrl}?response_type=code&client_id=${this.clientId}&code_challenge=${codeChallenge}&code_challenge_method=plain`
  }

  /**
   * @param  {String} code
   * @param  {String} codeVerifier
   */
  async generateAccessToken(code, codeVerifier) {
    try {
      const query = {
        client_id: this.clientId,
        code: code,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
      }

      const response = await axios.post(
        this.accessTokenUrl,
        querystring.stringify(query)
      )
      return response.data
    } catch (err) {
      console.error(err)
    }
  }
}

export default Mal
