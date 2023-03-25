import Breadcrumb from "@/components/Breadcrumb"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import Stats from "@/components/Stats"

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
