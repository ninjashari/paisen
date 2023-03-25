import { userDetail } from "../utils/api"

const USERKEY = "user"

export const login = (data) => {
  return userDetail(data)
}

export const getCurrentUser = () => {
  return localStorage.getItem(USERKEY)
}
