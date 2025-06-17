import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const Sidebar = () => {
  const router = useRouter()

  const [homeClass, setHomeClass] = useState("nav-link collapsed")
  const [statisticsClass, setStatisticsClass] = useState("nav-link collapsed")
  const [searchClass, setSearchClass] = useState("nav-link collapsed")
  const [seasonsClass, setSeasonsClass] = useState("nav-link collapsed")
  const [jellyfinClass, setJellyfinClass] = useState("nav-link collapsed")
  const [jellyfinInfoClass, setJellyfinInfoClass] = useState("nav-link collapsed")
  const [databaseInfoClass, setDatabaseInfoClass] = useState("nav-link collapsed")
  const [animeDatabaseClass, setAnimeDatabaseClass] = useState("nav-link collapsed")
  const [animeLibraryClass, setAnimeLibraryClass] = useState("nav-link collapsed")

  const [animeListClass, setAnimeListClass] = useState("nav-content collapse")
  const [animeListLinkClass, setAnimeListLinkClass] =
    useState("nav-link collapsed")

  const [currentAnimeListClass, setCurrentAnimeListClass] = useState("")
  const [completedAnimeListClass, setCompletedAnimeListClass] = useState("")
  const [onholdAnimeListClass, setOnholdAnimeListClass] = useState("")
  const [droppedAnimeListClass, setDroppedAnimeListClass] = useState("")
  const [plantowatchAnimeListClass, setPlantowatchAnimeListClass] = useState("")

  useEffect(() => {
    const currentPath = router?.asPath

    if ("/" === currentPath) {
      setHomeClass("nav-link")
    } else if ("/statistics" === currentPath) {
      setStatisticsClass("nav-link")
    } else if ("/search" === currentPath) {
      setSearchClass("nav-link")
    } else if ("/seasons" === currentPath) {
      setSeasonsClass("nav-link")
    } else if ("/jellyfin" === currentPath) {
      setJellyfinClass("nav-link")
    } else if ("/jellyfin-info" === currentPath) {
      setJellyfinInfoClass("nav-link")
    } else if ("/database-info" === currentPath) {
      setDatabaseInfoClass("nav-link")
    } else if ("/anime-database" === currentPath) {
      setAnimeDatabaseClass("nav-link")
    } else if ("/anime-library" === currentPath) {
      setAnimeLibraryClass("nav-link")
    } else if ("/animelist/current" === currentPath) {
      setAnimeListClass("nav-content")
      setAnimeListLinkClass("nav-link")
      setCurrentAnimeListClass("active")
    } else if ("/animelist/completed" === currentPath) {
      setAnimeListClass("nav-content")
      setAnimeListLinkClass("nav-link")
      setCompletedAnimeListClass("active")
    } else if ("/animelist/onhold" === currentPath) {
      setAnimeListClass("nav-content")
      setAnimeListLinkClass("nav-link")
      setOnholdAnimeListClass("active")
    } else if ("/animelist/dropped" === currentPath) {
      setAnimeListClass("nav-content")
      setAnimeListLinkClass("nav-link")
      setDroppedAnimeListClass("active")
    } else if ("/animelist/plantowatch" === currentPath) {
      setAnimeListClass("nav-content")
      setAnimeListLinkClass("nav-link")
      setPlantowatchAnimeListClass("active")
    }
  }, [])

  const handleShowAnimeList = (e) => {
    e.preventDefault()

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
          <Link className={homeClass} href="/">
            <i className="bi bi-grid"></i>
            <span>Home</span>
          </Link>
        </li>
        <li className="nav-item hand-on-hover">
          <div className={animeListLinkClass} onClick={handleShowAnimeList}>
            <i className="bi bi-menu-button-wide"></i>
            <span>Anime List</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </div>

          <ul id="components-nav" className={animeListClass}>
            <li>
              <Link href="/animelist/current" className={currentAnimeListClass}>
                <i className="bi bi-circle"></i>
                <span>Currently Watching</span>
              </Link>
            </li>
            <li>
              <Link
                href="/animelist/completed"
                className={completedAnimeListClass}
              >
                <i className="bi bi-circle"></i>
                <span>Completed</span>
              </Link>
            </li>
            <li>
              <Link href="/animelist/onhold" className={onholdAnimeListClass}>
                <i className="bi bi-circle"></i>
                <span>On Hold</span>
              </Link>
            </li>
            <li>
              <Link href="/animelist/dropped" className={droppedAnimeListClass}>
                <i className="bi bi-circle"></i>
                <span>Dropped</span>
              </Link>
            </li>
            <li>
              <Link
                href="/animelist/plantowatch"
                className={plantowatchAnimeListClass}
              >
                <i className="bi bi-circle"></i>
                <span>Plan To Watch</span>
              </Link>
            </li>
          </ul>
        </li>

        <li className="nav-item">
          <Link className={statisticsClass} href="/statistics">
            <i className="bi bi-bar-chart"></i>
            <span>Statistics</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className={searchClass} href="/search">
            <i className="bi bi-search"></i>
            <span>Search</span>
          </Link>
        </li>

        {/* <li className="nav-item">
          <Link className={seasonsClass} href="/seasons">
            <i className="bi bi-calendar3"></i>
            <span>Seasons</span>
          </Link>
        </li> */}

        <li className="nav-item">
          <Link className={jellyfinClass} href="/jellyfin">
            <i className="bi bi-server"></i>
            <span>Jellyfin</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className={jellyfinInfoClass} href="/jellyfin-info">
            <i className="bi bi-info-circle"></i>
            <span>Jellyfin Info</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className={animeDatabaseClass} href="/anime-database">
            <i className="bi bi-database"></i>
            <span>Anime Database</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className={animeLibraryClass} href="/anime-library">
            <i className="bi bi-collection"></i>
            <span>Anime Library</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className={databaseInfoClass} href="/database-info">
            <i className="bi bi-bar-chart-line"></i>
            <span>Database Info</span>
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
