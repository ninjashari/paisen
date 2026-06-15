import SearchTable from "@/components/animelist-search-table"
import AppLayout from "@/components/app-layout"
import Loader from "@/components/loader"
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
    <AppLayout
      title="Search"
      breadcrumb={{ firstPage: "Search", title: "Search" }}
      search={{ isLoading, malAccessToken, setSearchData }}
    >
      {loading ? (
        <Loader />
      ) : searchData.length > 0 ? (
        <SearchTable
          key={searchData.map((d) => d.id).join("_")}
          searchData={searchData}
          malAccessToken={malAccessToken}
        />
      ) : (
        <p className="text-muted-foreground">
          Use the search bar above to find anime and add them to your list.
        </p>
      )}
    </AppLayout>
  )
}

export default Search
