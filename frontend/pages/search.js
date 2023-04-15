import SearchTable from "@/components/animelist-search-table"
import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import { getUserAccessToken } from "@/utils/userService"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function Search() {
  const router = useRouter()
  const [loading, isLoading] = useState(true)
  const [malAccessToken, setMalAccessToken] = useState()
  const [searchData, setSearchData] = useState([])

  useEffect(() => {
    getAccessToken()
  }, [])

  const getAccessToken = async () => {
    const session = await getSession()
    if (session) {
      const accessToken = await getUserAccessToken(session)
      if (accessToken) {
        setMalAccessToken(accessToken)
        isLoading(false)
      } else {
        alert("Couldn't retrieve access token from user. Authorise MAL user")
      }
    } else {
      router.replace("/")
    }
  }

  return (
    <>
      <Layout titleName="Search" />
      <Header
        isLoading={isLoading}
        malAccessToken={malAccessToken}
        setSearchData={setSearchData}
      />
      <Sidebar currentPage="search" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Search" title="Search" />
        {loading ? <Loader /> : <SearchTable searchData={searchData} />}
      </main>
    </>
  )
}

export default Search
