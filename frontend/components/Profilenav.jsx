import Link from "next/link"
import React from "react"

const Profilenav = () => {
  return (
    <nav className="header-nav ms-auto">
      <ul className="d-flex align-items-center">
        <li className="nav-item dropdown pe-3">
          <Link
            className="nav-link nav-profile d-flex align-items-center pe-0"
            href="#"
            data-bs-toggle="dropdown"
          >
            <img
              src="/assets/img/profile.png"
              alt="Profile"
              className="rounded-circle"
            />
            <span className="d-none d-md-block dropdown-toggle ps-2">
              Username
            </span>
          </Link>
        </li>
        <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
          <li>
            <Link className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-box-arrow-right"></i>
              <span>Sign Out</span>
            </Link>
          </li>
        </ul>
      </ul>
    </nav>
  )
}

export default Profilenav
