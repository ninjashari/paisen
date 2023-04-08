import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"

function Statistics() {
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

export default Statistics
