import { searchAnime } from "@/utils/malClient"
import { Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"

const Searchbar = ({ isLoading, setSearchData, onError }) => {
  const [inputSearchString, setInputSearchString] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const query = e.target.query.value

    if (!query) {
      return
    }

    isLoading(true)
    if (onError) onError(null)

    try {
      const data = await searchAnime(query)
      setSearchData(data)
    } catch (err) {
      console.error("Search failed:", err)
      if (onError) onError(err.message)
      toast.error(err.message || "Couldn't search MyAnimeList")
    } finally {
      isLoading(false)
    }
  }

  return (
    <form
      className="relative w-full max-w-md"
      onSubmit={handleSubmit}
      role="search"
    >
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="text"
        name="query"
        placeholder="Search anime…"
        title="Enter search keyword"
        onChange={(e) => setInputSearchString(e.target.value)}
        value={inputSearchString}
        className="pl-9"
      />
    </form>
  )
}

export default Searchbar
