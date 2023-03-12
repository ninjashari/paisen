import React, { Component } from "react"

class Header extends Component {
  render() {
    return (
      <div>
        <nav
          className="navbar navbar-expand-lg bg-dark"
          data-bs-theme="dark"
          // style="margin-bottom: 4rem"
        >
          <div className="container">
            <a className="navbar-brand" href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                className="bi bi-p-square-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8.27 8.074c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97H8.27Z"></path>
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Zm3.5 4.002h2.962C10.045 4.002 11 5.104 11 6.586c0 1.494-.967 2.578-2.55 2.578H6.784V12H5.5V4.002Z"></path>
              </svg>
            </a>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a href="/" className="nav-link px-2 text-secondary">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/animelist" className="nav-link px-2 text-white">
                    Anime List
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/statistics" className="nav-link px-2 text-white">
                    Statistics
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/search" className="nav-link px-2 text-white">
                    Search
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/seasons" className="nav-link px-2 text-white">
                    Seasons
                  </a>
                </li>
              </ul>
              <form
                className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3"
                role="search"
              >
                <input
                  type="search"
                  className="form-control form-control-dark text-bg-dark"
                  placeholder="Search..."
                  aria-label="Search"
                  // style="color: white"
                />
              </form>
              <div className="text-end">
                <button type="button" className="btn btn-success">
                  Search
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    )
  }
}

export default Header
