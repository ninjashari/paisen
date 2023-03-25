import React from "react"
import { useSearchParams } from "react-router-dom"
import { updateUser, userDetail } from "../utils/api"
import Mal from "../utils/mal"

const Oauth = () => {
  const [searchParams] = useSearchParams("")

  const USERNAME = "USERNAME"

  const generateAccessToken = async () => {
    try {
      const storedUsername = sessionStorage.getItem(USERNAME)

      // Get User details from database
      const user = await userDetail(storedUsername)

      if (user) {
        const data = {
          username: storedUsername,
          code: searchParams.get("code"),
        }

        // Store code in database
        if (data.code !== undefined && data.code !== "") {
          await updateUser(data)

          //MAL client ID from env variables
          const clientId = process.env.REACT_APP_MYANIMELIST_CLIENT_ID

          // Generate access token
          const mal = new Mal(clientId)
          const res = await mal.generateAccessToken(
            data.code,
            user.challengeVerifier
          )
          console.log(res)

          const newData = {
            code: data.code,
            username: storedUsername,
            tokenType: res.token_type,
            refreshToken: res.refresh_token,
            expiryTime: res.expires_in,
            accessToken: res.access_token,
          }

          // Save access token data in database
          await updateUser(newData)

          // Redirect to animelist page
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  generateAccessToken()
    .then(() => {})
    .catch((err) => {
      console.error(err)
    })

  return <></>
}

export default Oauth
