import {
  calculateMeanScore,
  convertToDaysHrsMins,
  createDataArray,
  getRemainingDuration,
  getStatsAnimeObj,
  getTotalDuration,
} from "@/utils/malService"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const Stats = ({ animeList, isLoading }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Bar Chart Variables
  const [series, setSeries] = useState([])
  const chartData = {
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

  // Anime List Data Variables
  const [animeCount, setAnimeCount] = useState()
  const [episodeCount, setEpisodeCount] = useState()
  const [timeSpent, setTImeSpent] = useState()
  const [timeToSpend, setTimeToSpend] = useState()
  const [userMeanScore, setUserMeanScore] = useState()

  useEffect(() => {
    isLoading(true)

    // Convert animeList to node list
    let dataList = getStatsAnimeObj(animeList)

    // Bar chart
    let tempArr = []
    dataList.forEach((anime) => {
      if (anime.userScore > 0 && anime.userScore <= 10) {
        tempArr.push(anime.userScore)
      }
    })
    let scoreData = createDataArray(tempArr)
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

  const summaryRows = [
    { label: "Anime count", value: animeCount },
    { label: "Episode count", value: episodeCount },
    { label: "Time spent watching", value: timeSpent },
    { label: "Time to complete", value: timeToSpend },
    { label: "Mean score", value: userMeanScore },
  ]

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Watchlist Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="anime-list">
          <AccordionItem value="anime-list">
            <AccordionTrigger>Anime List</AccordionTrigger>
            <AccordionContent>
              <dl className="divide-border divide-y">
                {summaryRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2.5"
                  >
                    <dt className="text-muted-foreground text-sm">
                      {row.label}
                    </dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="score-distribution">
            <AccordionTrigger>Score Distribution</AccordionTrigger>
            <AccordionContent>
              <Chart
                options={chartData}
                series={series}
                type="bar"
                width="100%"
                height={350}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

export default Stats
