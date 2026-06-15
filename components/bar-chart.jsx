import MalApi from "@/lib/malApi"
import { fields } from "@/utils/constants"
import { createDataArray } from "@/utils/malService"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const BarChart = ({ animeList, isLoading, malAccessToken }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [series, setSeries] = useState([])
  const [scoreData, setScoreData] = useState([])

  const data = {
    chart: {
      type: "bar",
      height: 350,
      background: "transparent",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    theme: { mode: isDark ? "dark" : "light" },
    colors: ["#8b5cf6"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
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
    setScoreData(createDataArray(tempArr))
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
    <div>
      <h5 className="font-display mb-2 font-semibold">Score</h5>
      <Chart
        options={data}
        series={series}
        type="bar"
        width="100%"
        height={350}
      />
    </div>
  )
}

export default BarChart
