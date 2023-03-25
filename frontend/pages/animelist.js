import Breadcrumb from "@/components/Breadcrumb"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import Tabs from "@/components/Tabs"

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
