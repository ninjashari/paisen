import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import Head from "next/head"

export default function Home() {
  return (
    <>
      <Layout titleName="Paisen" />
      <Header />
      <Sidebar currentPage="home" />
      <main id="main" className="main">
        <Breadcrumb name="Home" />
      </main>
    </>
  )
}
