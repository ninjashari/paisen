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

export const updateUser = async (username, code) => {
  const response = await axios.post(`${baseUrl}/api/users/update`, {
    username: username,
    code: code,
  })

  console.log("response :: ", response)

  return response.data
}

export const userDetail = async (username) => {
  console.log(username)
  const response = await axios.post(`${baseUrl}/api/users/detail`, {
    username: username,
  })

  console.log("response :: ", response)

  return response.data
}
