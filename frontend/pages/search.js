import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import Head from "next/head"

function Search() {
  return (
    <>
      <Layout titleName="Search" />
      <Header />
      <Sidebar currentPage="search" />
      <main id="main" className="main">
        <Breadcrumb name="Search" />
      </main>
    </>
  )
}

export default Search
