import Anime from "@/lib/anime"
import { useEffect, useState } from "react"

const SearchTable = ({ searchData }) => {
  const [currentSearchData, setCurrentSearchData] = useState([])

  useEffect(() => {
    getAnimeSearchData()
  }, [])

  const getAnimeSearchData = () => {
    let tempData = []
    searchData.forEach((searchItem) => {
      const animeObj = new Anime(searchItem)
      tempData.push(animeObj)
    })
    setCurrentSearchData(tempData)
  }
  return (
    <>
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
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSearchData?.map((searchItem) => (
                <tr key={searchItem.id}>
                  <td className="col">{searchItem.title}</td>
                  <td className="col-1" style={{ textAlign: "center" }}>
                    {searchItem.mediaType}
                  </td>
                  <td className="col-1" style={{ textAlign: "center" }}>
                    {searchItem.totalEpisodes}
                  </td>
                  <td className="col-1" style={{ textAlign: "center" }}>
                    {searchItem.meanScore}
                  </td>
                  <td className="col-2" style={{ textAlign: "center" }}>
                    {searchItem.startSeason + " " + searchItem.startSeasonYear}
                  </td>
                  <td className="col-2" style={{ textAlign: "center" }}>
                    {searchItem.userStatus
                      ? searchItem.userStatus
                      : "Not Added"}
                  </td>
                  <td className="col-2">
                    <div className="row mb-3">
                      <div className="col-sm-10">
                        <select
                          className="form-select"
                          aria-label="Default select example"
                        >
                          <option selected>Open this select menu</option>
                          <option value="1">One</option>
                          <option value="2">Two</option>
                          <option value="3">Three</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default SearchTable
