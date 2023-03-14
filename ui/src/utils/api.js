import { baseUrl } from "./constants"
import axios from "axios"

export const addUser = async (
  username,
  code,
  pkceCodeChallenge,
  codeChallengeVerifier
) => {
  const response = await axios.post(`${baseUrl}/api/users/register`, {
    username: username,
    code: code,
    codeChallenge: pkceCodeChallenge,
    challengeVerifier: codeChallengeVerifier,
  })

  console.log("response :: ", response)

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
