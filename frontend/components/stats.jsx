import { useEffect, useState } from "react"
import BarChart from "./bar-chart"
import { getSession } from "next-auth/react"
import MalApi from "@/lib/malApi"
import { convertToDaysHrsMins } from "@/utils/helper"
import Loader from "./loader"
import { useRouter } from "next/router"

const Stats = () => {
  const router = useRouter()
  const [animeListHeaderClass, setAnimeListHeaderClass] =
    useState("accordion-button")
  const [animeListContentClass, setAnimeListContentClass] = useState(
    "accordion-collapse collapse show"
  )

  const [scoreDistributionHeaderClass, setScoreDistributionHeaderClass] =
    useState("accordion-button collapsed")
  const [scoreDistributionContentClass, setScoreDistributionContentClass] =
    useState("accordion-collapse collapse")

  const [localDatabaseHeaderClass, setLocalDatabaseHeaderClass] = useState(
    "accordion-button collapsed"
  )
  const [localDatabaseContentClass, setLocalDatabaseContentClass] = useState(
    "accordion-collapse collapse"
  )

  const [malUserData, setMalUserData] = useState()
  const [loading, setLoading] = useState(true)

  // MAL API Variables
  const fields = {
    user: ["anime_statistics"],
  }

  useEffect(() => {
    getMalUserData()
  }, [])

  const getMalUserData = async () => {
    try {
      const session = await getSession()
      if (session && session.user) {
        const userResponse = await fetch("/api/user/" + session.user.username)
        const userRes = await userResponse.json()
        const currentUserData = userRes.userData
        if (currentUserData && currentUserData.accessToken) {
          const malApi = new MalApi(currentUserData.accessToken)

          const resp = await malApi.getUserData(fields)
          if (200 === resp.status) {
            const malData = resp.data
            setMalUserData(malData)
            setLoading(false)
          } else {
            alert("Couldn't get user MAL data")
          }
        } else {
          alert("Couldn't get local user data")
        }
      } else {
        alert("Couldn't get session")
        router.replace("/")
      }
    } catch (err) {
      alert(err)
    }
  }

  // Accordion Functions
  const handleAnimeListClick = (e) => {
    e.preventDefault()

    if (
      "accordion-button" === animeListHeaderClass &&
      "accordion-collapse collapse show" === animeListContentClass
    ) {
      setAnimeListHeaderClass("accordion-button collapsed")
      setAnimeListContentClass("accordion-collapse collapse")
    } else if (
      "accordion-button collapsed" === animeListHeaderClass &&
      "accordion-collapse collapse" === animeListContentClass
    ) {
      setAnimeListHeaderClass("accordion-button")
      setAnimeListContentClass("accordion-collapse collapse show")
      setScoreDistributionHeaderClass("accordion-button collapsed")
      setScoreDistributionContentClass("accordion-collapse collapse")
      setLocalDatabaseHeaderClass("accordion-button collapsed")
      setLocalDatabaseContentClass("accordion-collapse collapse")
    }
  }

  const handleScoreDistributionClick = (e) => {
    e.preventDefault()

    if (
      "accordion-button" === scoreDistributionHeaderClass &&
      "accordion-collapse collapse show" === scoreDistributionContentClass
    ) {
      setScoreDistributionHeaderClass("accordion-button collapsed")
      setScoreDistributionContentClass("accordion-collapse collapse")
    } else if (
      "accordion-button collapsed" === scoreDistributionHeaderClass &&
      "accordion-collapse collapse" === scoreDistributionContentClass
    ) {
      setScoreDistributionHeaderClass("accordion-button")
      setScoreDistributionContentClass("accordion-collapse collapse show")
      setLocalDatabaseHeaderClass("accordion-button collapsed")
      setLocalDatabaseContentClass("accordion-collapse collapse")
      setAnimeListHeaderClass("accordion-button collapsed")
      setAnimeListContentClass("accordion-collapse collapse")
    }
  }

  const handleLocalDatabaseClick = (e) => {
    e.preventDefault()

    if (
      "accordion-button" === localDatabaseHeaderClass &&
      "accordion-collapse collapse show" === localDatabaseContentClass
    ) {
      setLocalDatabaseHeaderClass("accordion-button collapsed")
      setLocalDatabaseContentClass("accordion-collapse collapse")
    } else if (
      "accordion-button collapsed" === localDatabaseHeaderClass &&
      "accordion-collapse collapse" === localDatabaseContentClass
    ) {
      setLocalDatabaseHeaderClass("accordion-button")
      setLocalDatabaseContentClass("accordion-collapse collapse show")
      setScoreDistributionHeaderClass("accordion-button collapsed")
      setScoreDistributionContentClass("accordion-collapse collapse")
      setAnimeListHeaderClass("accordion-button collapsed")
      setAnimeListContentClass("accordion-collapse collapse")
    }
  }
  // End Accordion Functions
  return (
    <div className="row">
      {loading ? (
        <Loader />
      ) : (
        <div className="col-10">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Watchlist Statistics</h5>

              {/* Default Accordion */}
              <div className="accordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className={animeListHeaderClass}
                      type="button"
                      onClick={handleAnimeListClick}
                    >
                      Anime List
                    </button>
                  </h2>
                  <div className={animeListContentClass}>
                    <div className="accordion-body">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td>Anime count</td>
                            <td>{malUserData?.anime_statistics?.num_items}</td>
                          </tr>
                          <tr>
                            <td>Episode count</td>
                            <td>
                              {malUserData?.anime_statistics?.num_episodes}
                            </td>
                          </tr>

                          <tr>
                            <td>Time spent watching</td>
                            <td>
                              {convertToDaysHrsMins(
                                malUserData?.anime_statistics
                                  ?.num_days_completed
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Time to complete</td>
                            <td>
                              {convertToDaysHrsMins(
                                malUserData?.anime_statistics?.num_days_watching
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Mean score</td>
                            <td>{malUserData?.anime_statistics?.mean_score}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className={scoreDistributionHeaderClass}
                      type="button"
                      onClick={handleScoreDistributionClick}
                    >
                      Score Distribution
                    </button>
                  </h2>
                  <div className={scoreDistributionContentClass}>
                    <div className="accordion-body">
                      <BarChart />
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className={localDatabaseHeaderClass}
                      type="button"
                      onClick={handleLocalDatabaseClick}
                    >
                      Local Database
                    </button>
                  </h2>
                  <div id="collapseThree" className={localDatabaseContentClass}>
                    <div className="accordion-body">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td>Anime count</td>
                            <td>Dummy Text</td>
                          </tr>
                          <tr>
                            <td>Image files</td>
                            <td>Dummy Text</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stats
