import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/router"
import { useState } from "react"

function Search() {
  const [loading, isLoading] = useState(true)

  return (
    <>
      <Layout titleName="Search" />
      <Header isLoading={isLoading} />
      <Sidebar currentPage="search" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Search" title="Search" />
        {loading ? (
          <Loader />
        ) : (
          <>
            <h3>Searched Data Table</h3> <table></table>
          </>
        )}
      </main>
    </>
  )
}

export default Search
