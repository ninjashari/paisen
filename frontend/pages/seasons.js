import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import { useState } from "react"

function Seasons() {
  return (
    <>
      <Layout titleName="Seasons" />
      <Header />
      <Sidebar currentPage="seasons" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Seasons" title="Seasons" />
      </main>
    </>
  )
}

export default Seasons
