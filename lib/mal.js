import axios from 'axios'
import querystring from 'querystring'

class Mal {
  baseUrl = 'https://myanimelist.net/v1/oauth2'
  authorizeUrl = `${this.baseUrl}/authorize`
  accessTokenUrl = `${this.baseUrl}/token`

  constructor(clientId) {
    this.clientId = clientId
  }

  #tokenRequest(query) {
    return axios.post(this.accessTokenUrl, querystring.stringify(query), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
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
      const response = await this.#tokenRequest({
        client_id: this.clientId,
        code: code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
      })
      return response.data
    } catch (err) {
      console.error(err)
    }
  }

  /**
   *
   * @param {String} refreshToken
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await this.#tokenRequest({
        client_id: this.clientId,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      })
      return response.data
    } catch (err) {
      console.error(err)
    }
  }
}

export default Mal
