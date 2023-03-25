import React from "react"
import ProfileIcon from "./ProfileIcon"
import SignoutDropdown from "./SignoutDropdown"

const NavUserProfile = () => {
  return (
    // {/* Profile Nav */}
    <li className="nav-item pe-3">
      <ProfileIcon />
      <SignoutDropdown />
    </li>
    //   {/* End Profile Nav */}
  )
}

export default NavUserProfile
