import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"

function Search() {
  return (
    <>
      <Header />
      <Sidebar currentPage="search" />
      <main id="main" className="main">
        <Breadcrumb name="Search" />
        <section className="section">
          <Stats />
        </section>
      </main>
    </>
  )
}

export default Search
