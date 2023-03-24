import React from "react"

const Searchbar = () => {
  return (
    <div class="search-bar">
      <form
        class="search-form d-flex align-items-center"
        method="POST"
        action="#"
      >
        <input
          type="text"
          name="query"
          placeholder="Search"
          title="Enter search keyword"
        />
        <button type="submit" title="Search">
          <i class="bi bi-search"></i>
        </button>
      </form>
    </div>
  )
}

export default Searchbar
