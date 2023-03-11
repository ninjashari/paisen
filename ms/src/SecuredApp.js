import React from "react"
import Navbar from "./components/Navbar"
import Login from "./components/Login"

import data from './utils/secret.json'

function SecuredApp() {
  return (
    <div>
      <Navbar />
      <Login />
    </div>
  )
}

export default SecuredApp
