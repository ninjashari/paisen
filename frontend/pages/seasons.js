import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import { useState } from "react"

function Statistics() {
  const [loading, isLoading] = useState(false)
  return (
    <>
      <Layout titleName="Seasons" />
      <Header isLoading={isLoading} />
      <Sidebar currentPage="seasons" />

      {loading ? (
        <Loader />
      ) : (
        <main id="main" className="main">
          <Breadcrumb firstPage="Seasons" title="Seasons" />
        </main>
      )}
    </>
  )
}

export default Statistics
