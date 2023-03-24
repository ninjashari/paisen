import Link from "next/link"
import React from "react"

const Profilenav = () => {
  return (
    <nav className="header-nav ms-auto">
      <ul className="d-flex align-items-center">
        {/* Search Icon */}
        <li className="nav-item d-block d-lg-none">
          <a className="nav-link nav-icon search-bar-toggle" href="#">
            <i className="bi bi-search"></i>
          </a>
        </li>
        {/* End Search Icon */}

        {/* Profile Nav */}
        <li className="nav-item pe-3">
          {/* Profile Image Icon */}
          <a
            className="nav-link nav-profile d-flex align-items-center pe-0"
            href="#"
            data-bs-toggle="dropdown"
          >
            <i className="ri-account-circle-fill ri-2x"></i>
            <span className="d-none d-md-block dropdown-toggle ps-2">
              Username
            </span>
          </a>
          {/* End Profile Image Icon */}

          <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
            <li>
              <Link
                className="dropdown-item d-flex align-items-center"
                href="#"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Sign Out</span>
              </Link>
            </li>
          </ul>
        </li>
        {/* End Profile Nav */}
      </ul>
    </nav>
  )
}

export default Profilenav
