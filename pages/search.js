import SearchTable from "@/components/animelist-search-table"
import AppLayout from "@/components/app-layout"
import ErrorState from "@/components/error-state"
import Loader from "@/components/loader"
import { Search as SearchIcon } from "lucide-react"
import { useState } from "react"

function Search() {
  const [loading, setLoading] = useState(false)
  const [searchData, setSearchData] = useState([])
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleLoading = (value) => {
    setLoading(value)
    if (value) setHasSearched(true)
  }

  return (
    <AppLayout
      title="Search"
      breadcrumb={{ firstPage: "Search", title: "Search" }}
      search={{
        isLoading: handleLoading,
        setSearchData,
        onError: setError,
      }}
    >
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : searchData.length > 0 ? (
        <SearchTable
          key={searchData.map((d) => d.id).join("_")}
          searchData={searchData}
        />
      ) : (
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-20 text-center">
          <SearchIcon className="size-8 opacity-60" />
          <p>
            {hasSearched
              ? "No results found. Try a different search."
              : "Use the search bar above to find anime and add them to your list."}
          </p>
        </div>
      )}
    </AppLayout>
  )
}

export default Search
