import axios from "axios"
import { baseUrl } from "./constants"

export const authenticate = async (url) => {
  const response = await axios.post(`${baseUrl}/api/mal/authenticate`, {
    url: url
  })

  console.log("response :: ", response)

  return response
}
