import { updateAnime } from "@/utils/malClient"
import { userStatusList, userStatusReverseMap } from "@/utils/constants"
import { getAnimeObj, getWatchedPercentage } from "@/utils/malService"
import { ArrowDown, ArrowUp, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Loader from "./loader"
import Progressbar from "./progress-bar"
import ScoreSelect from "./score-select"
import SquareIcon from "./square-icon"

const nativeSelect =
  "border-input bg-background dark:bg-input/30 dark:[color-scheme:dark] focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-36 rounded-md border px-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"

const Table_ = ({ animeList }) => {
  const [animeDataList, setAnimeDataList] = useState([])
  const [loading, isLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  })

  useEffect(() => {
    let dataList = getAnimeObj(animeList)
    setAnimeDataList(dataList)
    isLoading(false)
  }, [])

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const sortedAnimeDataList = useMemo(() => {
    let sortableItems = [...animeDataList]
    if (sortConfig.key !== null) {
      const seasonMap = { winter: 0, spring: 1, summer: 2, fall: 3 }

      sortableItems.sort((a, b) => {
        let aValue
        let bValue

        if (sortConfig.key === "season") {
          const aSeason = a.startSeason?.toLowerCase()
          const bSeason = b.startSeason?.toLowerCase()
          aValue =
            (a.startSeasonYear || 0) * 10 +
            (seasonMap[aSeason] !== undefined ? seasonMap[aSeason] : -1)
          bValue =
            (b.startSeasonYear || 0) * 10 +
            (seasonMap[bSeason] !== undefined ? seasonMap[bSeason] : -1)
        } else if (sortConfig.key === "score") {
          aValue = a.userScore
          bValue = b.userScore
        } else {
          return 0
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [animeDataList, sortConfig])

  const handleWatchIncrement = async (animeId) => {
    // Increment watched episodes by one on click of plus
    let newList = []
    let prevWatchedEpisodes = 0
    let watchedEpisodes = 0
    let totalEpisodes = 0
    let currentStatus = undefined

    animeDataList.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        prevWatchedEpisodes = dataObj.episodesWatched
        dataObj.incrementWatchedEpisodes()
        watchedEpisodes = dataObj.episodesWatched
        totalEpisodes = dataObj.totalEpisodes
        currentStatus = userStatusReverseMap[dataObj.userStatus]
      }
      newList.push(dataObj)
    })
    setAnimeDataList(newList)

    // Call MAL api to update anime status
    const fieldsToUpdate = {
      num_watched_episodes: watchedEpisodes,
    }
    try {
      await updateAnime(animeId, fieldsToUpdate)

      if (watchedEpisodes === totalEpisodes && currentStatus !== "completed") {
        await changeCurrentUserStatus(animeId, "completed")
      } else if (
        parseInt(prevWatchedEpisodes) === 0 &&
        currentStatus !== "watching"
      ) {
        await changeCurrentUserStatus(animeId, "watching")
      }
    } catch (err) {
      console.error("Failed to update episodes:", err)
      toast.error(err.message || "Couldn't update anime list")
    }
  }

  const handleWatchDecrement = async (animeId) => {
    // Decrement watched episodes by one on click of minus
    let newList = []
    let watchedEpisodes = 0
    animeDataList.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        dataObj.decrementWatchedEpisodes()
        watchedEpisodes = dataObj.episodesWatched
      }
      newList.push(dataObj)
    })

    setAnimeDataList(newList)

    // call MAL api to update
    const fieldsToUpdate = {
      num_watched_episodes: watchedEpisodes,
    }
    try {
      await updateAnime(animeId, fieldsToUpdate)
    } catch (err) {
      console.error("Failed to update episodes:", err)
      toast.error(err.message || "Couldn't update anime list")
    }
  }

  const handleStatusChange = async (e) => {
    e.preventDefault()

    // Get target status
    const targetStatus = e.target.value
    // Get anime id
    const animeId = e.target.id

    await changeCurrentUserStatus(animeId, targetStatus)
  }

  const changeCurrentUserStatus = async (animeId, targetStatus) => {
    // Change status of anime in local list
    animeDataList.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        dataObj.setUserStatus(targetStatus)
      }
    })
    setAnimeDataList([...animeDataList])

    // Update in MAL DB using API call
    const fieldsToUpdate = {
      status: targetStatus,
    }
    try {
      await updateAnime(animeId, fieldsToUpdate)
    } catch (err) {
      console.error("Failed to update status:", err)
      toast.error(err.message || "Couldn't update anime list")
    }
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="ml-1 inline size-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5" />
    )
  }

  const canEditProgress = (anime) =>
    userStatusReverseMap[anime.userStatus] === "watching" ||
    userStatusReverseMap[anime.userStatus] === "on_hold" ||
    userStatusReverseMap[anime.userStatus] === "plan_to_watch"

  if (loading) {
    return <Loader />
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6" />
              <TableHead>Anime Title</TableHead>
              <TableHead className="min-w-56">Progress</TableHead>
              <TableHead
                className="hand-on-hover cursor-pointer select-none"
                onClick={() => requestSort("score")}
              >
                Score
                <SortIcon column="score" />
              </TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead
                className="hand-on-hover cursor-pointer text-center select-none"
                onClick={() => requestSort("season")}
              >
                Season
                <SortIcon column="season" />
              </TableHead>
              <TableHead>Change Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAnimeDataList?.map((anime) => (
              <TableRow key={anime.id}>
                <TableCell>
                  <SquareIcon
                    squareColor={anime.status.color}
                    title={anime.status.value}
                  />
                </TableCell>
                <TableCell className="font-medium whitespace-normal">
                  {anime.title}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      disabled={
                        !(
                          anime.episodesWatched > 0 &&
                          anime.episodesWatched <= anime.totalEpisodes &&
                          canEditProgress(anime)
                        )
                      }
                      onClick={() => handleWatchDecrement(anime.id)}
                      aria-label="Decrease watched episodes"
                    >
                      <Minus className="size-4" />
                    </Button>

                    <div className="min-w-20 flex-1">
                      <Progressbar
                        fillPercentage={getWatchedPercentage(
                          anime.episodesWatched,
                          anime.totalEpisodes
                        )}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      disabled={
                        !(
                          anime.episodesWatched >= 0 &&
                          anime.episodesWatched < anime.totalEpisodes &&
                          canEditProgress(anime)
                        )
                      }
                      onClick={() => handleWatchIncrement(anime.id)}
                      aria-label="Increase watched episodes"
                    >
                      <Plus className="size-4" />
                    </Button>

                    <span className="text-muted-foreground w-12 shrink-0 text-right text-xs tabular-nums">
                      {anime.episodesWatched + "/" + anime.totalEpisodes}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <ScoreSelect
                    selectedVal={anime.userScore}
                    animeID={anime.id}
                  />
                </TableCell>
                <TableCell className="text-center">{anime.mediaType}</TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  {anime.startSeason + " " + anime.startSeasonYear}
                </TableCell>
                <TableCell>
                  <select
                    className={nativeSelect}
                    id={anime.id}
                    value={userStatusReverseMap[anime.userStatus]}
                    onChange={handleStatusChange}
                  >
                    {userStatusList.map((userStatus) => (
                      <option
                        key={userStatus.apiValue}
                        value={userStatus.apiValue}
                      >
                        {userStatus.pageTitle}
                      </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default Table_
