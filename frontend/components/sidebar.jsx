import { sidebarItems } from "@/utils/constants"
import Link from "next/link"

const Sidebar = (props) => {
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
