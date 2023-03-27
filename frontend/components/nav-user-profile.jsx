import ProfileIcon from "./profile-icon"
import SignoutDropdown from "./signout-dropdown"

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
