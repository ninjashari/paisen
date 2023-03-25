import React from "react"

const SignoutDropdown = () => {
  return (
    <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
      <li>
        <Link className="dropdown-item d-flex align-items-center" href="#">
          <i className="bi bi-box-arrow-right"></i>
          <span>Sign Out</span>
        </Link>
      </li>
    </ul>
  )
}

export default SignoutDropdown
