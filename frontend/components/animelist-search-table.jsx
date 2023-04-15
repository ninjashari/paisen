import Anime from "@/lib/anime"
import MalApi from "@/lib/malApi"
import { useEffect, useState } from "react"

const SearchTable = ({ searchData }) => {
  const [currentSearchData, setCurrentSearchData] = useState([])

  useEffect(() => {
    console.log("searchData :: ", searchData)
    getAnimeSearchData()
  }, [])

  const getAnimeSearchData = () => {
    let tempData = []
    searchData.forEach((searchItem) => {
      const animeObj = new Anime(searchItem)
      console.log(animeObj)
      tempData.push(animeObj)
    })
    setCurrentSearchData(tempData)
  }
  return (
    <div className="card">
      <div className="card-body">
        <table className="table">
          <thead style={{ textAlign: "center" }}>
            <tr>
              <th scope="col">Anime Title</th>
              <th scope="col">Type</th>
              <th scope="col">Episodes</th>
              <th scope="col">Score</th>
              <th scope="col">Season</th>
            </tr>
          </thead>
          <tbody>
            {currentSearchData?.map((searchItem) => (
              <tr key={searchItem?.id}>
                <td className="col">{searchItem.title}</td>
                <td td className="col-2" style={{ textAlign: "center" }}>
                  {searchItem.mediaType}
                </td>
                <td td className="col-2" style={{ textAlign: "center" }}>
                  {searchItem.totalEpisodes}
                </td>
                <td td className="col-2" style={{ textAlign: "center" }}>
                  {searchItem.meanScore}
                </td>
                <td td className="col-2" style={{ textAlign: "center" }}>
                  {searchItem.startSeason + " " + searchItem.startSeasonYear}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SearchTable
