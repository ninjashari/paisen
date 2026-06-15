import Anime from "@/lib/anime"
import { updateAnime } from "@/utils/malClient"
import { userStatusList, userStatusReverseMap } from "@/utils/constants"
import { toast } from "sonner"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const nativeSelect =
  "border-input bg-background dark:bg-input/30 dark:[color-scheme:dark] focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-36 rounded-md border px-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"

const SearchTable = ({ searchData }) => {
  const [currentSearchData, setCurrentSearchData] = useState([])

  useEffect(() => {
    getAnimeSearchData()
  }, [])

  const getAnimeSearchData = () => {
    let tempData = []
    searchData.forEach((searchItem) => {
      const animeObj = new Anime(searchItem)
      tempData.push(animeObj)
    })
    setCurrentSearchData(tempData)
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
    let newList = []
    currentSearchData.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        dataObj.setUserStatus(targetStatus)
      }
      newList.push(dataObj)
    })
    setCurrentSearchData(newList)

    // Update in MAL DB using API call
    try {
      await updateAnime(animeId, { status: targetStatus })
      toast.success("Anime list updated")
    } catch (err) {
      console.error("Failed to update status:", err)
      toast.error(err.message || "Couldn't update anime list")
    }
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anime Title</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Episodes</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Season</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Change Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSearchData?.map((searchItem) => (
              <TableRow key={searchItem.id}>
                <TableCell className="font-medium whitespace-normal">
                  {searchItem.title}
                </TableCell>
                <TableCell className="text-center">
                  {searchItem.mediaType}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {searchItem.totalEpisodes}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {searchItem.meanScore}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  {searchItem.startSeason + " " + searchItem.startSeasonYear}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={searchItem.userStatus ? "secondary" : "outline"}>
                    {searchItem.userStatus ? searchItem.userStatus : "Not Added"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <select
                    className={nativeSelect}
                    id={searchItem.id}
                    value={
                      userStatusReverseMap[searchItem.userStatus]
                        ? userStatusReverseMap[searchItem.userStatus]
                        : "not_added"
                    }
                    onChange={handleStatusChange}
                  >
                    <option value="not_added">Not Added</option>
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

export default SearchTable
