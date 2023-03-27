import Breadcrumb from "@/components/Breadcrumb"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { Inter } from "next/font/google"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  return (
    <>
      <Header />
      <Sidebar currentPage="home" />
      <main id="main" className="main">
        <Breadcrumb name="Home" />
      </main>
    </>
  )
}
