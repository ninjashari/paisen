import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

function Statistics() {
  return (
    <>
      <Header />
      <Sidebar currentPage="seasons" />
      <main id="main" className="main">
        <Breadcrumb name="Seasons" />
      </main>
    </>
  )
}

export default Statistics
