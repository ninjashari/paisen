import React from "react"

function SearchInput() {
  return (
    <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
      <input
        type="search"
        className="form-control form-control-dark text-bg-dark"
        placeholder="Search..."
        aria-label="Search"
      />
    </form>
  )
}

export default SearchInput
