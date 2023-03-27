import Logo from "./logo"
import Profilenav from "./profile-nav"
import Searchbar from "./search-bar"

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
