import axios from "axios"

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
}

export default MalApi
