import { useSearchParams } from "react-router-dom"

function Authorized() {
  const [searchParams] = useSearchParams("")

  console.log("code :: ", searchParams.get("code"))
  console.log("username :: ", searchParams.get("state"))

  const code = searchParams.get("code")
  const username = searchParams.get("state")
}

export default Authorized
