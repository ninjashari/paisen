import axios from "axios"
import { baseUrl } from "./constants"

export const addUser = async (data) => {
  axios.defaults.headers["Content-Type"] = "application/json"
  const response = await axios.post(`${baseUrl}/api/users/register`, {
    username: data.username,
    code: data.code,
    codeChallenge: data.codeChallenge,
    challengeVerifier: data.challengeVerifier,
  })
  return response.data
}

export const updateUser = async (data) => {
  axios.defaults.headers["Content-Type"] = "application/json"
  const response = await axios.post(`${baseUrl}/api/users/update`, data)

  return response.data
}

export const userDetail = async (username) => {
  axios.defaults.headers["Content-Type"] = "application/json"
  const response = await axios.post(`${baseUrl}/api/users/detail`, {
    username: username,
  })

  return response.data
}
