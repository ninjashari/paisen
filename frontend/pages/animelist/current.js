import Table from "@/components/animelist-table"
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
        <section className="section">
          <div className="row">
            <Table />
          </div>
        </section>
      </main>
    </>
  )
}
