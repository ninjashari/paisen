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
        {loading ? (
          <Loader />
        ) : (
          <>
            <h3>Searched Data Table</h3>{" "}
            <table className="table">
              <thead style={{ textAlign: "center" }}>
                <tr>
                  {/* <th scope="col"></th> */}
                  <th scope="col">Anime Title</th>
                  {/* <th scope="col">Progress</th>
                  <th scope="col">Score</th>
                  <th scope="col">Type</th>
                  <th scope="col">Season</th> */}
                </tr>
              </thead>
              <tbody>
                {searchData?.map((searchItem) => (
                  <tr key={searchItem?.id}>
                    <td className="col-3">{searchItem.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </>
  )
}

export default Search
