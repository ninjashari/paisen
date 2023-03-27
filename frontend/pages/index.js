import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Head from "next/head"

export default function Home() {
  return (
    <>
      <Head>
        <title>Paisen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <Sidebar currentPage="home" />
      <main id="main" className="main">
        <Breadcrumb name="Home" />
      </main>
    </>
  )
}
