import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"

function Search() {
  return (
    <>
      <Layout titleName="Search" />
      <Header />
      <Sidebar currentPage="search" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Search" title="Search" />
      </main>
    </>
  )
}

export default Search
