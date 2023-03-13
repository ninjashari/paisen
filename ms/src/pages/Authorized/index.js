import React from "react"
import { useSearchParams } from "react-router-dom"
import Header from "../../components/layout/Header"

function Authorized() {
  const [searchParams, setSearchParams] = useSearchParams("")

  console.log(searchParams.get("code"))
  console.log(searchParams.get("state"))

  return <Header />
}

export default Authorized
