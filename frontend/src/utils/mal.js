import axios from "axios"
import querystring from "querystring"

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

  /**
   * @param  {String} code
   * @param  {String} codeVerifier
   */
  accessToken(code, codeVerifier) {
    return new Promise((resolve, reject) => {
      const query = {
        client_id: this.clientId,
        code: code,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
      }

      axios
        .post(this.accessTokenUrl, querystring.stringify(query))
        .then((response) => {
          resolve(response.data)
        })
        .catch((err) => {
          reject(err.response.data)
        })
    })
  }
}

export default Mal
