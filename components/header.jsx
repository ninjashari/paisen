import { useRouter } from "next/router"
import Logo from "./logo"
import Profilenav from "./profile-nav"
import Searchbar from "./search-bar"
import { useEffect, useState } from "react"

const Header = ({ isLoading, malAccessToken, setSearchData }) => {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    if (router.asPath === "/search") {
      setShowSearch(true)
    }
  })
  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <Logo />
      {showSearch ? (
        <Searchbar
          isLoading={isLoading}
          malAccessToken={malAccessToken}
          setSearchData={setSearchData}
        />
      ) : (
        ""
      )}

      <Profilenav />
    </header>
  )
}

export default Header
