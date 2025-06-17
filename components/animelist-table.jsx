import MalApi from "@/lib/malApi"
import { userStatusList, userStatusReverseMap } from "@/utils/constants"
import { getAnimeObj, getWatchedPercentage } from "@/utils/malService"
import { useEffect, useMemo, useState } from "react"
import Loader from "./loader"
import Progressbar from "./progress-bar"
import ScoreSelect from "./score-select"
import SquareIcon from "./square-icon"
import axios from "axios"

const Table = ({ animeList, malAccessToken }) => {
  const [animeDataList, setAnimeDataList] = useState([])
  const [loading, isLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })

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
            (a.startSeasonYear || 0) * 10 + (seasonMap[aSeason] !== undefined ? seasonMap[aSeason] : -1)
          bValue =
            (b.startSeasonYear || 0) * 10 + (seasonMap[bSeason] !== undefined ? seasonMap[bSeason] : -1)
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

  const handleWatchIncrement = async (e) => {
    e.preventDefault()

    // Get anime id
    const animeId = e.target.id

    // Increment watched episodes by one on click of plus
    let newList = []
    let prevWatchedEpisodes = 0
    let watchedEpisodes = 0
    let totalEpisodes = 0
    let currentStatus = undefined
    
    animeDataList.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        // console.log(dataObj)
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
    if (malAccessToken) {
      const malApi = new MalApi(malAccessToken)
      const res = await malApi.updateList(animeId, fieldsToUpdate)

      // console.log(currentStatus)

      if (200 === res.status) {
        if (
          watchedEpisodes === totalEpisodes &&
          currentStatus !== "completed"
        ) {
          await changeCurrentUserStatus(animeId, "completed")
        } else if (
          parseInt(prevWatchedEpisodes) === 0 &&
          currentStatus !== "watching"
        ) {
          await changeCurrentUserStatus(animeId, "watching")
        }
        isLoading(false)
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch local user data")
    }
  }

  const handleWatchDecrement = async (e) => {
    e.preventDefault()

    // Get anime id
    const animeId = e.target.id

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
    if (malAccessToken) {
      const malApi = new MalApi(malAccessToken)
      const res = await malApi.updateList(animeId, fieldsToUpdate)

      if (200 === res.status) {
        isLoading(false)
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch access token from parent")
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
    if (malAccessToken) {
      const malApi = new MalApi(malAccessToken)
      const res = await malApi.updateList(animeId, fieldsToUpdate)

      if (200 === res.status) {
        isLoading(false)
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch local user data")
    }
  }
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <div className="card-body">
            <table className="table">
              <thead style={{ textAlign: "center" }}>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Anime Title</th>
                  <th scope="col">Progress</th>
                  <th
                    scope="col"
                    onClick={() => requestSort("score")}
                    style={{ cursor: "pointer" }}
                  >
                    Score{" "}
                    {sortConfig.key === "score"
                      ? sortConfig.direction === "ascending"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th scope="col">Type</th>
                  <th
                    scope="col"
                    onClick={() => requestSort("season")}
                    style={{
                      cursor: "pointer",
                      textAlign: "center",
                      paddingLeft: "0px",
                      paddingRight: "0px",
                    }}
                  >
                    Season{" "}
                    {sortConfig.key === "season"
                      ? sortConfig.direction === "ascending"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th scope="col">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedAnimeDataList?.map((anime) => (
                  <tr key={anime.id} className="col">
                    <th>
                      {" "}
                      <SquareIcon
                        squareColor={anime.status.color}
                        title={anime.status.pageTitle}
                      />
                    </th>
                    <td style={{ textAlign: "left" }}>
                      <a href={`/anime/${anime.id}`}>{anime.title}</a>
                    </td>
                    <td>
                      <div className="row" style={{ alignItems: "center" }}>
                        <div className="col-md-2">
                          <button
                            type="button"
                            id={anime.id}
                            className="btn btn-primary-outline"
                            onClick={handleWatchIncrement}
                            style={{ all: "unset", cursor: "pointer" }}
                          >
                            <i id={anime.id} className="bi bi-plus-circle"></i>
                          </button>
                        </div>
                        <div className="col-md-8">
                          {anime.episodesWatched + " / " + anime.totalEpisodes}
                        </div>
                        <div className="col-md-2">
                          <button
                            type="button"
                            id={anime.id}
                            className="btn btn-primary-outline"
                            onClick={handleWatchDecrement}
                            style={{ all: "unset", cursor: "pointer" }}
                          >
                            <i id={anime.id} className="bi bi-dash-circle"></i>
                          </button>
                        </div>
                        <div className="col-md-12">
                          <Progressbar
                            progress={getWatchedPercentage(
                              anime.episodesWatched,
                              anime.totalEpisodes
                            )}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <ScoreSelect
                        score={anime.userScore}
                        malAccessToken={malAccessToken}
                        animeId={anime.id}
                      />
                    </td>
                    <td>{anime.mediaType.toUpperCase()}</td>
                    <td style={{ textAlign: "center" }}>
                      {anime.startSeason?.replace("_", " ")}
                      <br />
                      {anime.startSeasonYear}
                    </td>
                    <td>
                      <select
                        id={anime.id}
                        className="form-select"
                        aria-label="Default select example"
                        onChange={handleStatusChange}
                        value={userStatusReverseMap[anime.userStatus]}
                      >
                        {userStatusList.map((status, key) => (
                          <option key={key} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default Table
