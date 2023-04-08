import axios from "axios"

class MalApi {
  http = axios.default.create()
  urlBase = "https://api.myanimelist.net/v2"

  fields = {
    user: [
      "id",
      "name",
      "picture",
      "gender",
      "birthday",
      "location",
      "joined_at",
      "anime_statistics",
      "time_zone",
      "is_supporter",
    ],
  }

  constructor(token) {
    this.http.defaults.baseURL = this.urlBase
    this.http.defaults.headers["Authorization"] = `Bearer ${token}`
  }

  async getUserData() {
    const res = await this.http.get(`/users/@me`, {
      params: {
        fields: this.fields.user.toString(),
      },
    })
    return res
  }

  async getCurrentList(fieldsA) {
    const res = await this.http.get(`/users/@me/animelist`, {
      params: {
        fields: fieldsA.animeList.toString(),
        status: "watching",
        limit: 1000,
      },
    })
    return res
  }

  async getCompletedList(fieldsA) {
    const res = await this.http.get(`/users/@me/animelist`, {
      params: {
        fields: fieldsA.animeList.toString(),
        status: "completed",
        limit: 1000,
      },
    })
    return res
  }

  async getOnHoldList(fieldsA) {
    const res = await this.http.get(`/users/@me/animelist`, {
      params: {
        fields: fieldsA.animeList.toString(),
        status: "on_hold",
        limit: 1000,
      },
    })
    return res
  }

  async getDroppedList(fieldsA) {
    const res = await this.http.get(`/users/@me/animelist`, {
      params: {
        fields: fieldsA.animeList.toString(),
        status: "dropped",
        limit: 1000,
      },
    })
    return res
  }

  async getPlanToWatchList(fieldsA) {
    const res = await this.http.get(`/users/@me/animelist`, {
      params: {
        fields: fieldsA.animeList.toString(),
        status: "plan_to_watch",
        limit: 1000,
      },
    })
    return res
  }
}

export default MalApi
