import { useSearchParams } from "react-router-dom"
import Header from "../components/layout/Header"
import { updateUser, userDetail } from "../utils/api"
import { authenticate } from "../utils/MAL_API"

async function Authorized() {
  const [searchParams] = useSearchParams("")

  const code = searchParams.get("code")
  const state = searchParams.get("state")

  const response = await updateUser(state, code)

  console.log("response :: ", response)
  console.log("username :: ", searchParams.get("state"))

  const currentUser = await userDetail(state)

  console.log("currentUser :: ", currentUser)

  const url =
    "https://myanimelist.net/v1/oauth2/token?client_id=" +
    process.env.REACT_APP_MYANIMELIST_CLIENT_ID +
    "&client_secret=" +
    process.env.REACT_APP_MYANIMELIST_CLIENT_SECRET +
    "&grant_type=authorization_code&code=" +
    code +
    "&code_verifier=" +
    currentUser.challengeVerifier

  console.log("url :: ", url)

  const result = await authenticate(url)

  console.log("result :: ", result)

  // window.location.href = "http://localhost:3000/animelist"

  return <Header />
}

export default Authorized
