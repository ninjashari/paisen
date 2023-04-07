import Link from "next/link"
import { useState } from "react"

const Sidebar = () => {
  const [animeListClass, setAnimeListClass] = useState("nav-content collapse")
  const [animeListLinkClass, setAnimeListLinkClass] =
    useState("nav-link collapsed")

  const handleShowAnimeList = (e) => {
    e.preventDefault()
    console.log(animeListClass)
    console.log(animeListLinkClass)
    if ("nav-content" === animeListClass && "nav-link" === animeListLinkClass) {
      setAnimeListClass("nav-content collapsing")
      setAnimeListClass("nav-content collapse")
      setAnimeListLinkClass("nav-link collapsed")
    } else if (
      "nav-content collapse" === animeListClass &&
      "nav-link collapsed" === animeListLinkClass
    ) {
      setAnimeListClass("nav-content")
      setAnimeListLinkClass("nav-link")
    }
  }
  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item">
          <Link className="nav-link collapsed" href="/">
            <i className="bi bi-grid"></i>
            <span>Home</span>
          </Link>
        </li>
        <li className="nav-item">
          <a
            className={animeListLinkClass}
            onClick={handleShowAnimeList}
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-menu-button-wide"></i>
            <span>Anime List</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </a>

          <ul id="components-nav" className={animeListClass}>
            <li>
              <Link href="/animelist/current" className="active">
                <i className="bi bi-circle"></i>
                <span>Currently Watching</span>
              </Link>
            </li>
            <li>
              <Link href="/animelist/completed">
                <i className="bi bi-circle"></i>
                <span>Completed</span>
              </Link>
            </li>
            <li>
              <Link href="/animelist/onhold">
                <i className="bi bi-circle"></i>
                <span>On Hold</span>
              </Link>
            </li>
            <li>
              <Link href="/animelist/dropped">
                <i className="bi bi-circle"></i>
                <span>Dropped</span>
              </Link>
            </li>
            <li>
              <Link href="/animelist/plantowatch">
                <i className="bi bi-circle"></i>
                <span>Plan To Watch</span>
              </Link>
            </li>
          </ul>
        </li>

        <li className="nav-item">
          <Link className="nav-link collapsed" href="/statistics">
            <i className="bi bi-bar-chart"></i>
            <span>Statictics</span>
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

        <li className="nav-item">
          <Link className="nav-link collapsed" href="/jellyfin">
            <i className="bi bi-link"></i>
            <span>Jellyfin</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link collapsed" href="/authorise">
            <i className="bi bi-shield-check"></i>
            <span>Authorize</span>
          </Link>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar
