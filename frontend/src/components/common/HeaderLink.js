import React from "react"
import { useLocation } from "react-router-dom"

function HeaderLink(props) {
  const { link, title } = props
  const location = useLocation()
  return (
    <li className="nav-item">
      <a
        href={link}
        className={`nav-link px-2 ${
          location.pathname === link ? "text-secondary" : "text-dark"
        }`}
      >
        {title}
      </a>
    </li>
  )
}

export default HeaderLink