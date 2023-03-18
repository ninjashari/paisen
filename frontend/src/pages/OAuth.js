import React from "react"
import { useSearchParams } from "react-router-dom"
import { updateUser, userDetail } from "../utils/api"

function Oauth() {
  const [searchParams] = useSearchParams("")

  const USERNAME = "USERNAME"

  const generateAccessToken = async () => {
    const storedUsername = sessionStorage.getItem(USERNAME)
    console.log(storedUsername)

    // Get User details from database
    const user = await userDetail(storedUsername)
    console.log(user)

    if (user) {
      const code = searchParams.get("code")
      console.log(code)

      // Store code in databse
      if (code !== undefined && code !== "") {
        const resp = await updateUser(storedUsername, code)
        console.log(resp)
      }
    }
  }

  generateAccessToken()

  return <></>
}

export default Oauth
