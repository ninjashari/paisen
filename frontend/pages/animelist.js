import Tabs from "@/components/animelist-tabs"
import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

export default function Animelist() {
  return (
    <>
      <Header />
      <Sidebar currentPage="animelist" />
      <main id="main" className="main">
        <Breadcrumb name="Anime List" />
        <section className="section">
          <div className="row">
            <Tabs />
          </div>
        </section>
      </main>
    </>
  )
}
