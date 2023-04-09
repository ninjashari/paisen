import MalApi from "@/lib/malApi"
import { getAnimeObj, getWatchedPercentage } from "@/utils/malService"
import { useEffect, useState } from "react"
import Loader from "./loader"
import Progressbar from "./progress-bar"
import ScoreSelect from "./score-select"
import SquareIcon from "./square-icon"

const Table = ({ animeList, malAccessToken }) => {
  const [animeDataList, setAnimeDataList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let dataList = getAnimeObj(animeList)

    setAnimeDataList(dataList)
    setLoading(false)
  }, [])

  const handleWatchIncrement = async (e) => {
    e.preventDefault()

    setLoading(true)

    const animeId = e.target.id

    let newList = []
    let watchedEpisodes = 0
    animeDataList.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        dataObj.incrementWatchedEpisodes()
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
        setLoading(false)
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch local user data")
    }
  }

  const handleWatchDecrement = async (e) => {
    e.preventDefault()
    setLoading(true)

    const animeId = e.target.id

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
        setLoading(false)
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch access token from parent")
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
                  <th scope="col">Score</th>
                  <th scope="col">Type</th>
                  <th scope="col">Season</th>
                </tr>
              </thead>
              <tbody>
                {animeDataList?.map((anime) => (
                  <tr key={anime.id}>
                    <th scope="row">
                      <SquareIcon
                        squareColor={anime.status.color}
                        title={anime.status.value}
                      />
                    </th>
                    <td className="col-3">{anime.title}</td>
                    <td>
                      <div className="row">
                        {/* Decrement watched episodes */}
                        <div className="col-1">
                          {anime.episodesWatched > 0 &&
                          anime.episodesWatched <= anime.totalEpisodes &&
                          (anime.userStatus === "watching" ||
                            anime.userStatus === "on_hold" ||
                            anime.userStatus === "plan_to_watch") ? (
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={handleWatchDecrement}
                            >
                              <i className="bi bi-dash" id={anime.id}></i>
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                        {/* End Decrement watched episodes */}

                        {/* Progress Bar */}
                        <div className="col">
                          <Progressbar
                            fillPercentage={getWatchedPercentage(
                              anime.episodesWatched,
                              anime.totalEpisodes
                            )}
                          />
                        </div>
                        {/* End Progress Bar */}

                        {/* Increment watched episodes */}
                        <div className="col-1">
                          {anime.userStatus === "watching" ||
                          anime.userStatus === "on_hold" ||
                          anime.userStatus === "plan_to_watch" ? (
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={handleWatchIncrement}
                            >
                              <i className="bi bi-plus" id={anime.id}></i>
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                        {/* End Increment watched episodes */}

                        {/* Value of watched/total episodes */}
                        <div className="col-3">
                          {anime.episodesWatched + "/" + anime.totalEpisodes}
                        </div>
                        {/* End Value of watched/total episodes */}
                      </div>
                    </td>
                    <td className="col-2">
                      <ScoreSelect
                        selectedVal={anime.userScore}
                        animeID={anime.id}
                        malAccessToken={malAccessToken}
                        loading={loading}
                      />
                    </td>
                    <td className="col-2" style={{ textAlign: "center" }}>
                      {anime.mediaType}
                    </td>
                    <td className="col-1" style={{ textAlign: "center" }}>
                      {anime.startSeason + " " + anime.startSeasonYear}
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
