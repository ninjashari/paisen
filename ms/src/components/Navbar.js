import React, { Component } from "react";

class Navbar extends Component {
  render() {
    return (
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
          <a class="navbar-brand" href="/">
            SALMS
          </a>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/">
                  Anime
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/">
                  Manga
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/">
                  Login
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/">
                  Sign Up
                </a>
              </li>
            </ul>
            <form class="d-flex" role="search">
              <input
                class="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button class="btn btn-outline-success" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
