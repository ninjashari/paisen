import Anime from "@/lib/anime"
import { updateAnime } from "@/utils/malClient"
import { userStatusReverseMap } from "@/utils/constants"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import AnimePoster from "@/components/anime-poster"
import StatusSelect from "@/components/status-select"

/**
 * Redesigned search results — a responsive poster grid. Each card lets the user
 * set/change the watch status, persisting to MAL.
 * Props: searchData (raw MAL nodes).
 */
const SearchResults = ({ searchData }) => {
  const [items, setItems] = useState([])
  // Tracks the current api-value status per anime id (incl. "not_added").
  const [statuses, setStatuses] = useState({})

  useEffect(() => {
    const objs = searchData.map((node) => new Anime(node))
    setItems(objs)
    const initial = {}
    objs.forEach((a) => {
      initial[a.id] = userStatusReverseMap[a.userStatus] || "not_added"
    })
    setStatuses(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onStatus = async (animeId, status) => {
    const prev = statuses[animeId]
    setStatuses((s) => ({ ...s, [animeId]: status }))
    try {
      await updateAnime(animeId, { status })
      toast.success("Added to your list")
    } catch (err) {
      console.error("Failed to update status:", err)
      toast.error(err.message || "Couldn't update anime list")
      setStatuses((s) => ({ ...s, [animeId]: prev }))
    }
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
      {items.map((anime) => (
        <Card
          key={anime.id}
          className="group hover:ring-primary/40 gap-0 overflow-hidden p-0 py-0 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-1"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden">
            <AnimePoster
              src={anime.imageUrl}
              alt={anime.title}
              className="size-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
              <Badge className="bg-black/55 border-0 text-[10px] text-white backdrop-blur">
                {anime.mediaType}
              </Badge>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3">
              <h3 className="line-clamp-2 text-sm font-semibold text-white">
                {anime.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/80">
                <span>
                  {anime.startSeason} {anime.startSeasonYear}
                </span>
                {anime.meanScore ? (
                  <span className="flex items-center gap-0.5">
                    <Star className="text-warning size-3" />
                    {anime.meanScore}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="p-3">
            <StatusSelect
              value={statuses[anime.id] || "not_added"}
              onValueChange={(s) => onStatus(anime.id, s)}
              includeNotAdded
            />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default SearchResults
