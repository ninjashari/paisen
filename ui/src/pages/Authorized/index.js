import React, { useState } from "react"
import { useSearchParams } from "react-router-dom"
import Header from "../../components/layout/Header"

function Authorized() {
  const [searchParams, setSearchParams] = useSearchParams("")
  const [code, setCode] = useState()
  const [username, setUsername] = useState()

  console.log(searchParams.get("code"))
  console.log(searchParams.get("state"))

  setCode(searchParams.get("code"))
  setUsername(searchParams.get("state"))

  return <Header />
}

export default Authorized
