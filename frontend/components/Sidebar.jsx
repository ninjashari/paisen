import Link from "next/link"
import React from "react"

const Sidebar = () => {
  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item">
          <Link className="nav-link" href="/">
            <i className="bi bi-grid"></i>
            <span>Home</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link collapsed" href="/animelist">
            <i className="bi bi-menu-button-wide"></i>
            <span>Anime List</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link collapsed" href="/statistics">
            <i className="bi bi-bar-chart"></i>
            <span>Statistics</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link collapsed" href="/search">
            <i className="bi bi-search"></i>
            <span>Search</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link collapsed" href="/seasons">
            <i className="bi bi-calendar3"></i>
            <span>Seasons</span>
          </Link>
        </li>

        <li className="nav-heading">Pages</li>

        <li className="nav-item">
          <a className="nav-link collapsed" href="/register">
            <i className="bi bi-card-list"></i>
            <span>Register</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link collapsed" href="/login">
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link collapsed" href="/jellyfin">
            <i className="bi bi-link"></i>
            <span>Jellyfin</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link collapsed" href="/authorise">
            <i className="bi bi-shield-check"></i>
            <span>Authorize</span>
          </a>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar
