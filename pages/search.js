import SearchResults from "@/components/animelist-search-table"
import AppShell from "@/components/app-shell"
import ErrorState from "@/components/error-state"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { searchAnime } from "@/utils/malClient"
import { Search as SearchIcon } from "lucide-react"
import { useRouter } from "next/router"
import { useState } from "react"
import { toast } from "sonner"

function ResultsSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="gap-0 overflow-hidden p-0 py-0">
          <div className="shimmer aspect-[2/3] w-full" />
          <div className="p-3">
            <div className="shimmer h-8 w-full rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function Search() {
  const router = useRouter()

  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const runSearch = async (e) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const data = await searchAnime(q)
      setResults(data)
    } catch (err) {
      console.error("Search failed:", err)
      if (err.message === "Authentication required") return router.replace("/")
      if (err.message.startsWith("Authorize")) return router.replace("/authorise")
      setError(err.message)
      toast.error(err.message || "Search failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Search" subtitle="Find anime and add it to your list.">
      <div className="flex flex-col gap-6">
        <form onSubmit={runSearch}>
          <div className="glass focus-within:ring-primary/40 flex items-center gap-2 rounded-2xl p-2 transition-shadow focus-within:ring-2">
            <SearchIcon className="text-muted-foreground ml-2 size-5 shrink-0" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for an anime…"
              className="h-11 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              autoFocus
            />
            <Button
              type="submit"
              variant="brand"
              className="h-11 rounded-xl px-6"
              disabled={loading || !query.trim()}
            >
              Search
            </Button>
          </div>
        </form>

        {loading ? (
          <ResultsSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={runSearch} />
        ) : results.length > 0 ? (
          <SearchResults
            key={results.map((d) => d.id).join("_")}
            searchData={results}
          />
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-20 text-center">
            <SearchIcon className="size-8 opacity-60" />
            <p>
              {hasSearched
                ? "No results found. Try a different search."
                : "Search for an anime to get started."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default Search
