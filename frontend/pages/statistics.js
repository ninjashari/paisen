import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Stats from "@/components/stats"

function Statistics() {
  return (
    <>
      <Header />
      <Sidebar currentPage="statistics" />
      <main id="main" className="main">
        <Breadcrumb name="Statistics" />
        <section className="section">
          <Stats />
        </section>
      </main>
    </>
  )
}

export default Statistics
