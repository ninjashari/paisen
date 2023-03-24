import React from "react"
import Logo from "./Logo"
import Searchbar from "./Searchbar"
import Profilenav from "./Profilenav"

const Header = () => {
  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <Logo />
      <Searchbar />
      <Profilenav />
    </header>
  )
}

export default Header
