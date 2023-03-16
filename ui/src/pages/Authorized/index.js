import { useSearchParams } from "react-router-dom"
import Header from "../../components/layout/Header"
import { updateUser } from "../../utils/api"

async function Authorized() {
  const [searchParams] = useSearchParams("")

  const code = searchParams.get("code")
  const state = searchParams.get("state")

  const response = await updateUser(state, code)

  console.log("response :: ", response)
  console.log("username :: ", searchParams.get("state"))

  window.location.href = "http://localhost:3000/animelist"

  return <Header />
}

export default Authorized
