import axios from "axios"
const querystring = require("querystring")

/**
 * Server-side MyAnimeList API client.
 *
 * IMPORTANT: this must only be used from server-side code (API routes). MAL's
 * API does not support browser CORS, so all calls are proxied through our own
 * `/api/mal/*` endpoints which use this client.
 */
class MalApi {
  urlBase = "https://api.myanimelist.net/v2"

  constructor(token) {
    this.http = axios.create({
      baseURL: this.urlBase,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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

  async updateList(animeID, fieldsToUpdate) {
    const res = await this.http.put(
      `/anime/${animeID}/my_list_status`,
      querystring.stringify(fieldsToUpdate),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    return res
  }

  async getSearchAnimeList(searchString, fields) {
    const res = await this.http.get(`/anime`, {
      params: {
        q: searchString,
        fields: fields.animeList.toString(),
        limit: 100,
        nsfw: 1,
        offset: 0,
      },
    })
    return res
  }
}

export default MalApi
