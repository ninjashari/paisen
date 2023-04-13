import MalApi from "@/lib/malApi"
import { fields } from "@/utils/constants"
import { createDataArray } from "@/utils/malService"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const BarChart = ({ animeList, isLoading, malAccessToken }) => {
  const [series, setSeries] = useState([])
  const [scoreData, setScoreData] = useState([])

  const data = {
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

  useEffect(() => {
    isLoading(true)

    let tempArr = []
    animeList.forEach((anime) => {
      if (anime.userScore > 0 && anime.userScore <= 10) {
        tempArr.push(anime.userScore)
      }
    })
    console.log(tempArr)
    setScoreData(createDataArray(tempArr))
    console.log(scoreData)
    setSeries([
      {
        name: "number",
        data: scoreData,
      },
    ])

    getUserData()

    isLoading(false)
  }, [])

  const getUserData = async () => {
    const malApi = new MalApi(malAccessToken)
    const resp = await malApi.getAnimeList(fields)
    return resp
  }

  return (
    <>
      <div className="card-body">
        <h5 className="card-title">Score</h5>
        <div className="row">
          <Chart options={data} series={series} type="bar" width="800" />
        </div>
      </div>
    </>
  )
}

export default BarChart
