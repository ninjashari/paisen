import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Stats from "@/components/stats"
import Head from "next/head"

function Statistics() {
  return (
    <>
      <Head>
        <title>Paisen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
