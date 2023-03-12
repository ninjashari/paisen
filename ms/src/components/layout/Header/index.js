import React from "react"
import pagesList from "../../../utils/constants"
import BrandIcon from "../../common/BrandIcon"
import HeaderLink from "../../common/HeaderLink"
import SearchButton from "../../common/SearchButton"
import SearchInput from "../../common/SearchInput"

function Header() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
        <div className="container">
          <BrandIcon />

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
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

export default Header
