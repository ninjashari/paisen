import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import Stats from "@/components/Stats"

function Statistics() {
  return (
    <>
      <Header />
      <Sidebar />
      <main id="main" className="main">
        <section className="section">
          <Stats />
        </section>
      </main>
    </>
  )
}

export default Statistics
