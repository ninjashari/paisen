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
import { useMemo } from "react"
import { Clock, Film, Hourglass, Star, Tv } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const Stats = ({ animeList }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const { metrics, series } = useMemo(() => {
    // Convert animeList to node list
    const dataList = getStatsAnimeObj(animeList)

    // Score distribution
    const tempArr = []
    dataList.forEach((anime) => {
      if (anime.userScore > 0 && anime.userScore <= 10) {
        tempArr.push(anime.userScore)
      }
    })
    const scoreData = createDataArray(tempArr)

    // Episode count
    let episodeCount = 0
    dataList.forEach((data) => {
      episodeCount += data.totalEpisodes
    })

    // Durations
    const timeSpent = convertToDaysHrsMins(getTotalDuration(dataList))
    const timeToSpend = convertToDaysHrsMins(getRemainingDuration(dataList))

    return {
      series: [{ name: "number", data: scoreData }],
      metrics: {
        animeCount: dataList.length,
        episodeCount,
        timeSpent,
        timeToSpend,
        userMeanScore: calculateMeanScore(dataList),
      },
    }
  }, [animeList])

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

  const statCards = [
    { label: "Anime count", value: metrics.animeCount, icon: Film },
    { label: "Episode count", value: metrics.episodeCount, icon: Tv },
    { label: "Time spent watching", value: metrics.timeSpent, icon: Clock },
    { label: "Time to complete", value: metrics.timeToSpend, icon: Hourglass },
    { label: "Mean score", value: metrics.userMeanScore, icon: Star },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-2xl font-bold tabular-nums">
                  {value}
                </div>
                <div className="text-muted-foreground text-sm">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={chartData}
            series={series}
            type="bar"
            width="100%"
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default Stats
