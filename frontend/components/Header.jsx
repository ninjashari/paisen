import React from 'react';
import Logo from "./Logo"
import Profilenav from "./Profilenav"
import Searchbar from "./Searchbar"

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
