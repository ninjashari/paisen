import {
  calculateMeanScore,
  convertToDaysHrsMins,
  createDataArray,
  getAnimeObj,
  getRemainingDuration,
  getTotalDuration,
} from "@/utils/malService"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const Stats = ({ animeList, isLoading }) => {
  // Bar Chart Variables
  const [series, setSeries] = useState([])
  // Bar chart
  const chartData = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"],
    },
  }
  // End Bar Chart Variables

  // Accordion UI class variables
  const [animeListHeaderClass, setAnimeListHeaderClass] =
    useState("accordion-button")
  const [animeListContentClass, setAnimeListContentClass] = useState(
    "accordion-collapse collapse show"
  )
  const [scoreDistributionHeaderClass, setScoreDistributionHeaderClass] =
    useState("accordion-button collapsed")
  const [scoreDistributionContentClass, setScoreDistributionContentClass] =
    useState("accordion-collapse collapse")
  // const [localDatabaseHeaderClass, setLocalDatabaseHeaderClass] = useState(
  //   "accordion-button collapsed"
  // )
  // const [localDatabaseContentClass, setLocalDatabaseContentClass] = useState(
  //   "accordion-collapse collapse"
  // )
  // End Accordion UI class variables

  // Anime List Data Variables
  const [animeDataList, setAnimeDataList] = useState([])
  const [animeCount, setAnimeCount] = useState()
  const [episodeCount, setEpisodeCount] = useState()
  const [timeSpent, setTImeSpent] = useState()
  const [timeToSpend, setTimeToSpend] = useState()
  const [userMeanScore, setUserMeanScore] = useState()
  // End Anime List Data Variables
  useEffect(() => {
    isLoading(true)

    // Convert animeList to node list
    let dataList = getAnimeObj(animeList)

    // Bar chart
    let tempArr = []
    dataList.forEach((anime) => {
      if (anime.userScore > 0 && anime.userScore <= 10) {
        tempArr.push(anime.userScore)
      }
    })
    console.log(tempArr)
    let scoreData = createDataArray(tempArr)
    console.log(scoreData)
    setSeries([
      {
        name: "number",
        data: scoreData,
      },
    ])

    // Set anime count
    setAnimeCount(dataList.length)

    // Set episode count
    let count = 0
    dataList.forEach((data) => {
      count += data.totalEpisodes
    })
    setEpisodeCount(count)

    // Set watched episodes duration
    let totalDuration = getTotalDuration(dataList)
    let formattedTotalDuration = convertToDaysHrsMins(totalDuration)
    setTImeSpent(formattedTotalDuration)

    // Set Time to watch remaining episodes
    let remainingDuration = getRemainingDuration(dataList)
    let formattedRemDuration = convertToDaysHrsMins(remainingDuration)
    setTimeToSpend(formattedRemDuration)

    // Set Mean Score
    setUserMeanScore(calculateMeanScore(dataList))

    isLoading(false)
  }, [])

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

  // const handleLocalDatabaseClick = (e) => {
  //   e.preventDefault()

  //   if (
  //     "accordion-button" === localDatabaseHeaderClass &&
  //     "accordion-collapse collapse show" === localDatabaseContentClass
  //   ) {
  //     setLocalDatabaseHeaderClass("accordion-button collapsed")
  //     setLocalDatabaseContentClass("accordion-collapse collapse")
  //   } else if (
  //     "accordion-button collapsed" === localDatabaseHeaderClass &&
  //     "accordion-collapse collapse" === localDatabaseContentClass
  //   ) {
  //     setLocalDatabaseHeaderClass("accordion-button")
  //     setLocalDatabaseContentClass("accordion-collapse collapse show")
  //     setScoreDistributionHeaderClass("accordion-button collapsed")
  //     setScoreDistributionContentClass("accordion-collapse collapse")
  //     setAnimeListHeaderClass("accordion-button collapsed")
  //     setAnimeListContentClass("accordion-collapse collapse")
  //   }
  // }
  // // End Accordion Functions

  return (
    <div className="row">
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
                          <td>{animeCount}</td>
                        </tr>
                        <tr>
                          <td>Episode count</td>
                          <td>{episodeCount}</td>
                        </tr>

                        <tr>
                          <td>Time spent watching</td>
                          <td>{timeSpent}</td>
                        </tr>
                        <tr>
                          <td>Time to complete</td>
                          <td>{timeToSpend}</td>
                        </tr>
                        <tr>
                          <td>Mean score</td>
                          <td>{userMeanScore}</td>
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
                    <div className="card-body">
                      <h5 className="card-title">Score</h5>
                      <div className="row">
                        <Chart
                          options={chartData}
                          series={series}
                          type="bar"
                          width="800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="accordion-item">
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
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats
