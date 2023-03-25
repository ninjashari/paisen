import Link from "next/link"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"

const Sidebar = (props) => {
  const sidebarItems = [
    {
      id: 0,
      key: "home",
      name: "Home",
      icon: "bi bi-grid",
      href: "/",
    },
    {
      id: 1,
      key: "animelist",
      name: "Anime List",
      icon: "bi bi-menu-button-wide",
      href: "/animelist",
    },
    {
      id: 2,
      key: "statistics",
      name: "Statistics",
      icon: "bi bi-bar-chart",
      href: "/statistics",
    },
    {
      id: 3,
      key: "search",
      name: "Search",
      icon: "bi bi-search",
      href: "/search",
    },
    {
      id: 4,
      key: "seasons",
      name: "Seasons",
      icon: "bi bi-calendar3",
      href: "/seasons",
    },
    {
      id: 5,
      key: "register",
      name: "Register",
      icon: "bi bi-card-list",
      href: "/register",
    },
    {
      id: 6,
      name: "Login",
      key: "login",
      icon: "bi bi-box-arrow-in-right",
      href: "/login",
    },
    {
      id: 7,
      key: "jellyfin",
      name: "Jellyfin",
      icon: "bi bi-link",
      href: "/jellyfin",
    },
    {
      id: 8,
      name: "Authorize",
      key: "authorise",
      icon: "bi bi-shield-check",
      href: "/authorise",
    },
  ]

  sidebarItems.forEach((sidebarItem) => {
    if (
      props.currentPage !== undefined &&
      props.currentPage !== "" &&
      props.currentPage === sidebarItem.key
    ) {
      sidebarItem.linkClass = "nav-link"
    } else {
      sidebarItem.linkClass = "nav-link collapsed"
    }
  })

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        {sidebarItems.map((sidebarItem) => (
          <li className="nav-item" key={sidebarItem.key}>
            <Link className={sidebarItem.linkClass} href={sidebarItem.href}>
              <i className={sidebarItem.icon}></i>
              <span>{sidebarItem.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
