import { useSession } from "next-auth/react"
import { useEffect } from "react"
import NavLoginButton from "./nav-login-button"
import NavSearchIcon from "./nav-search-button"
import NavUserProfile from "./nav-user-profile"

const Profilenav = () => {
  const { data: session } = useSession()

  return (
    <nav className="header-nav ms-auto">
      <ul className="d-flex align-items-center">
        <NavSearchIcon />
        {session ? (
          <NavUserProfile />
        ) : (
          <li className="nav-item pe-3">
            <NavLoginButton text="Login/ Register" />
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Profilenav
