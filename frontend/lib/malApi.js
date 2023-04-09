import axios from "axios"
const querystring = require("querystring")

class MalApi {
  http = axios.default.create()
  urlBase = "https://api.myanimelist.net/v2"

  constructor(token) {
    this.http.defaults.baseURL = this.urlBase
    this.http.defaults.headers["Authorization"] = `Bearer ${token}`
  }

  async getUserData(fields) {
    const res = await this.http.get(`/users/@me`, {
      params: {
        fields: fields.user.toString(),
      },
    })
    return res
  }

  async getAnimeList(fields, status) {
    const res = await this.http.get(`/users/@me/animelist`, {
      params: {
        fields: fields.animeList.toString(),
        status: status,
        limit: 1000,
        nsfw: 1,
      },
    })
    return res
  }

  async getFullAnimeList(fields) {
    const res = await this.http.get(`/users/@me/animelist`, {
      params: {
        fields: fields.animeList.toString(),
        limit: 1000,
        nsfw: 1,
      },
    })
    return res
  }

  async updateList(animeID, fieldsToUpdate) {
    this.http.defaults.headers["Content-Type"] =
      "application/x-www-form-urlencoded"
    const res = await this.http.put(
      `/anime/${animeID}/my_list_status`,
      querystring.stringify(fieldsToUpdate)
    )
    return res
  }
}

export default MalApi
