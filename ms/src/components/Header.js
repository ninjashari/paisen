import React, { Component } from "react"
import BrandIcon from "./BrandIcon"
import HeaderLink from "./HeaderLink"
import SearchButton from "./SearchButton"
import SearchInput from "./SearchInput"
import pagesList from "../utils/constants"

class Header extends Component {
  render() {


    return (
      <div>
        <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
          <div className="container">
            <BrandIcon />

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {pagesList.map((item, index) => (
                  <HeaderLink key={index} title={item.title} link={item.link} />
                ))}
              </ul>

              <SearchInput />

              <div className="text-end">
                <SearchButton />
              </div>
            </div>
          </div>
        </nav>
      </div>
    )
  }
}

export default Header
