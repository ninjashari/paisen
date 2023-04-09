import MalApi from "@/lib/malApi"
import { createDataArray } from "@/utils/malService"
import { getSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const BarChart = () => {
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
      // Get user data
      const session = await getSession()

      if (session && session.user) {
        const userResponse = await fetch("/api/user/" + session.user.username)
        const userRes = await userResponse.json()
        const currentUserData = userRes.userData
        if (currentUserData && currentUserData.accessToken) {
          const malApi = new MalApi(currentUserData.accessToken)

          const resp = await malApi.getFullAnimeList(field)
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
                name: "Score",
                data: scoreData,
              },
            ])
            setLoading(false)
          } else {
            alert("Couldn't fetch graph data")
          }
        } else {
          alert("Couldn't fetch local user data")
        }
      }
    } catch (error) {
      alert(error)
    }
  }

  return (
    <>
      {loading ? (
        <div className="container">
          <section className="section register d-flex flex-column align-items-center justify-content-center">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
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
