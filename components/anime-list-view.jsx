import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, LayoutGrid, Rows3, Tv } from "lucide-react"

import { updateAnime } from "@/utils/malClient"
import { getAnimeObj } from "@/utils/malService"
import { userStatusReverseMap } from "@/utils/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AnimeGridCard from "./anime-grid-card"
import AnimePoster from "./anime-poster"
import EpisodeStepper from "./episode-stepper"
import ScoreControl from "./score-control"
import StatusSelect from "./status-select"

const VIEW_KEY = "paisen.listView"

const canEditProgress = (anime) =>
  ["watching", "on_hold", "plan_to_watch"].includes(
    userStatusReverseMap[anime.userStatus]
  )

const airingDot = {
  green: "bg-success",
  blue: "bg-info",
  red: "bg-destructive",
}

/**
 * Shared anime list surface — grid or table, with inline mutations that
 * optimistically update local state then persist to MAL.
 * Props: animeList (raw MAL list with { node }).
 */
const AnimeListView = ({ animeList }) => {
  const [items, setItems] = useState([])
  const [view, setView] = useState("grid")
  const [sort, setSort] = useState({ key: null, dir: "asc" })

  useEffect(() => {
    setItems(getAnimeObj(animeList))
  }, [animeList])

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem(VIEW_KEY)
    if (saved === "grid" || saved === "table") setView(saved)
  }, [])

  const setViewMode = (v) => {
    setView(v)
    if (typeof window !== "undefined") localStorage.setItem(VIEW_KEY, v)
  }

  const commit = () => setItems((prev) => [...prev])

  const persist = async (animeId, fields, errMsg) => {
    try {
      await updateAnime(animeId, fields)
    } catch (err) {
      console.error(errMsg, err)
      toast.error(err.message || errMsg)
    }
  }

  const findAnime = (id) =>
    items.find((a) => parseInt(a.id) === parseInt(id))

  const onStatus = async (animeId, status) => {
    const a = findAnime(animeId)
    if (!a) return
    a.setUserStatus(status)
    commit()
    await persist(animeId, { status }, "Couldn't update status")
  }

  const onScore = async (animeId, score) => {
    const a = findAnime(animeId)
    if (!a) return
    a.userScore = score
    commit()
    await persist(animeId, { score }, "Couldn't update score")
  }

  const onIncrement = async (animeId) => {
    const a = findAnime(animeId)
    if (!a) return
    const prev = a.episodesWatched || 0
    a.incrementWatchedEpisodes()
    commit()
    const watched = a.episodesWatched
    await persist(animeId, { num_watched_episodes: watched }, "Couldn't update episodes")
    const status = userStatusReverseMap[a.userStatus]
    if (a.totalEpisodes && watched === a.totalEpisodes && status !== "completed") {
      await onStatus(animeId, "completed")
    } else if (prev === 0 && status !== "watching") {
      await onStatus(animeId, "watching")
    }
  }

  const onDecrement = async (animeId) => {
    const a = findAnime(animeId)
    if (!a) return
    a.decrementWatchedEpisodes()
    commit()
    await persist(animeId, { num_watched_episodes: a.episodesWatched }, "Couldn't update episodes")
  }

  const requestSort = (key) => {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }))
  }

  const sorted = useMemo(() => {
    if (!sort.key) return items
    const seasonMap = { winter: 0, spring: 1, summer: 2, fall: 3 }
    const arr = [...items]
    arr.sort((a, b) => {
      let av, bv
      if (sort.key === "season") {
        av = (a.startSeasonYear || 0) * 10 + (seasonMap[a.startSeason?.toLowerCase()] ?? -1)
        bv = (b.startSeasonYear || 0) * 10 + (seasonMap[b.startSeason?.toLowerCase()] ?? -1)
      } else if (sort.key === "score") {
        av = a.userScore || 0
        bv = b.userScore || 0
      } else if (sort.key === "title") {
        av = a.title?.toLowerCase() || ""
        bv = b.title?.toLowerCase() || ""
      } else return 0
      if (av < bv) return sort.dir === "asc" ? -1 : 1
      if (av > bv) return sort.dir === "asc" ? 1 : -1
      return 0
    })
    return arr
  }, [items, sort])

  const SortIcon = ({ col }) =>
    sort.key !== col ? null : sort.dir === "asc" ? (
      <ArrowUp className="ml-1 inline size-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5" />
    )

  if (!items.length) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-20 text-center">
          <Tv className="size-8 opacity-50" />
          <p>Nothing here yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} {items.length === 1 ? "title" : "titles"}
        </p>
        <div className="bg-muted/60 flex items-center gap-0.5 rounded-full p-0.5">
          <Button
            variant={view === "grid" ? "brand" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 rounded-full px-3"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" /> Grid
          </Button>
          <Button
            variant={view === "table" ? "brand" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 rounded-full px-3"
            onClick={() => setViewMode("table")}
          >
            <Rows3 className="size-4" /> Table
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {sorted.map((anime) => (
            <AnimeGridCard
              key={anime.id}
              anime={anime}
              apiStatus={userStatusReverseMap[anime.userStatus]}
              canEdit={canEditProgress(anime)}
              onStatus={(s) => onStatus(anime.id, s)}
              onScore={(v) => onScore(anime.id, v)}
              onIncrement={() => onIncrement(anime.id)}
              onDecrement={() => onDecrement(anime.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12" />
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort("title")}>
                    Title <SortIcon col="title" />
                  </TableHead>
                  <TableHead className="min-w-56">Progress</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort("score")}>
                    Score <SortIcon col="score" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-center" onClick={() => requestSort("season")}>
                    Season <SortIcon col="season" />
                  </TableHead>
                  <TableHead className="min-w-40">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((anime) => (
                  <TableRow key={anime.id}>
                    <TableCell>
                      <AnimePoster
                        src={anime.imageUrl}
                        alt={anime.title}
                        className="aspect-[2/3] w-10 rounded-md"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{anime.title}</div>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                        <span className={cn("size-1.5 rounded-full", airingDot[anime.status?.color] || "bg-muted-foreground")} />
                        {anime.status?.value || anime.status} · {anime.mediaType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <EpisodeStepper
                        watched={anime.episodesWatched || 0}
                        total={anime.totalEpisodes}
                        canEdit={canEditProgress(anime)}
                        onIncrement={() => onIncrement(anime.id)}
                        onDecrement={() => onDecrement(anime.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <ScoreControl
                        value={anime.userScore}
                        onValueChange={(v) => onScore(anime.id, v)}
                      />
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap text-sm">
                      {anime.startSeason} {anime.startSeasonYear}
                    </TableCell>
                    <TableCell>
                      <StatusSelect
                        value={userStatusReverseMap[anime.userStatus]}
                        onValueChange={(s) => onStatus(anime.id, s)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AnimeListView
