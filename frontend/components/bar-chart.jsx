import { ApexCharts } from "@/public/apexcharts/apexcharts.amd"
import { useEffect } from "react"

const BarChart = () => {
  // useEffect(() => {
  //   new ApexCharts(document.querySelector("#barChart"), {
  //     series: [
  //       {
  //         data: [30, 60, 203, 121, 64, 6, 0, 0, 0, 0],
  //       },
  //     ],
  //     chart: {
  //       type: "bar",
  //       height: 350,
  //     },
  //     plotOptions: {
  //       bar: {
  //         borderRadius: 4,
  //         horizontal: true,
  //       },
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     xaxis: {
  //       categories: ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"],
  //     },
  //   }).render()
  // }, [])

  return (
    <div className="card-body">
      <h5 className="card-title">Score</h5>
      <div className="row">
        <div id="barChart"></div>
      </div>
    </div>
  )
}

export default BarChart
