import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"

function Jellyfin() {
  return (
    <>
      <Layout titleName="Jellyfin" />
      <Header />
      <Sidebar currentPage="jellyfin" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Jellyfin" title="Jellyfin" />
      </main>
    </>
  )
}

export default Jellyfin
