import Tabs from "@/components/animelist-tabs"
import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"

export default function Animelist() {
  return (
    <>
      <Layout titleName="Animelist" />
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
