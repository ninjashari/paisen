import axios from "axios"

export const addUser = async (data) => {
  axios.defaults.headers["Content-Type"] = "application/json"
  const url = "http://localhost:5000/api/users/register"
  console.log(url)
  const response = await axios.post(url, data)
  return response.data
}
