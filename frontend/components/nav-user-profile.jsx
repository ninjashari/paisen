import { signOut, useSession } from "next-auth/react"
import { useState } from "react"

const NavUserProfile = () => {
  const { data: session } = useSession()

  const [profileNavClass, setPofileNavClass] = useState(
    "nav-link nav-profile d-flex align-items-center pe-0"
  )
  const [signOutClass, setSignOutClass] = useState(
    "dropdown-menu dropdown-menu-end dropdown-menu-arrow profile"
  )

  const handleProfileNavClick = (e) => {
    e.preventDefault()
    if (
      "nav-link nav-profile d-flex align-items-center pe-0" ===
        profileNavClass &&
      "dropdown-menu dropdown-menu-end dropdown-menu-arrow profile" ===
        signOutClass
    ) {
      setPofileNavClass(
        "nav-link nav-profile d-flex align-items-center pe-0 show"
      )
      setSignOutClass(
        "dropdown-menu dropdown-menu-end dropdown-menu-arrow profile show"
      )
    } else if (
      "nav-link nav-profile d-flex align-items-center pe-0 show" ===
        profileNavClass &&
      "dropdown-menu dropdown-menu-end dropdown-menu-arrow profile show" ===
        signOutClass
    ) {
      setPofileNavClass("nav-link nav-profile d-flex align-items-center pe-0")
      setSignOutClass(
        "dropdown-menu dropdown-menu-end dropdown-menu-arrow profile"
      )
    }
  }

  return (
    <>
      {/* Profile Nav  */}
      <li className="nav-item pe-3 hand-on-hover">
        <div className={profileNavClass} onClick={handleProfileNavClick}>
          <i className="ri-account-circle-fill ri-2x"></i>
          <span className="d-none d-md-block dropdown-toggle ps-2">
            {session?.user?.name}
          </span>
        </div>
      </li>
      {/* End Profile Nav  */}

      {/* Sign Out Dropdown */}
      <ul
        className={signOutClass}
        style={{
          position: "absolute",
          inset: "0px 0px auto auto",
          margin: "0px",
          transform: "translate3d(-16px, 38px, 0px)",
        }}
      >
        <li className="hand-on-hover">
          <div
            className="dropdown-item d-flex align-items-center"
            onClick={() => signOut()}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </div>
        </li>
      </ul>
      {/* End Sign Out Dropdown */}
    </>
  )
}

export default NavUserProfile
