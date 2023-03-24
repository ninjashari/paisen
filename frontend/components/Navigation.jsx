import React from "react"
import Link from "next/link"
import Logo from "./Logo"
import Searchbar from "./Searchbar"
import Profilenav from "./Profilenav"

const Navigation = () => {
  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <Logo />
      <Searchbar />
      <Profilenav />
    </header>
  )
}

export default Navigation
