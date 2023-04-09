import MalApi from "@/lib/malApi"
import { createDataArray } from "@/utils/malService"
import { getSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import Loader from "./loader"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const BarChart = ({ malAccessToken }) => {
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState([])
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

  const field = {
    animeList: ["my_list_status"],
  }

  useEffect(() => {
    getAnimeList()
  }, [])

  const getAnimeList = async () => {
    try {
      if (malAccessToken) {
        const malApi = new MalApi(malAccessToken)

        const resp = await malApi.getAnimeList(field, undefined)
        if (200 === resp.status) {
          const malData = resp.data
          const animeData = malData.data
          const scoreArray = []
          animeData.forEach((element) => {
            if (
              element?.node?.my_list_status?.score &&
              element?.node?.my_list_status?.score > 0
            ) {
              scoreArray.push(element?.node?.my_list_status?.score)
            }
          })
          const scoreData = createDataArray(scoreArray)
          setSeries([
            {
              name: "number",
              data: scoreData,
            },
          ])
          setLoading(false)
        } else {
          alert("Couldn't fetch graph data")
        }
      } else {
        alert("Couldn't fetch MAL access token")
      }
    } catch (error) {
      alert(error)
    }
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="card-body">
          <h5 className="card-title">Score</h5>
          <div className="row">
            <Chart options={data} series={series} type="bar" width="800" />
          </div>
        </div>
      )}
    </>
  )
}

export default BarChart
