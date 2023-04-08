import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import Stats from "@/components/stats"

function Statistics() {
  return (
    <>
      <Layout titleName="Statistics" />
      <Header />
      <Sidebar currentPage="statistics" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Statistics" title="Statistics" />
        <section className="section">
          <Stats />
        </section>
      </main>
    </>
  )
}

export default Statistics
