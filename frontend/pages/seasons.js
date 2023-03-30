import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Head from "next/head"

function Statistics() {
  return (
    <>
      <Head>
        <title>Paisen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <Sidebar currentPage="seasons" />
      <main id="main" className="main">
        <Breadcrumb name="Seasons" />
      </main>
    </>
  )
}

export default Statistics
