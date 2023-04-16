import Anime from "@/lib/anime"
import MalApi from "@/lib/malApi"
import { userStatusList, userStatusReverseMap } from "@/utils/constants"
import { useEffect, useState } from "react"

const SearchTable = ({ searchData, malAccessToken }) => {
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

  const handleStatusChange = async (e) => {
    e.preventDefault()

    // Get target status
    const targetStatus = e.target.value
    // Get anime id
    const animeId = e.target.id

    await changeCurrentUserStatus(animeId, targetStatus)
  }

  const changeCurrentUserStatus = async (animeId, targetStatus) => {
    // Change status of anime in local list
    let newList = []
    currentSearchData.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        dataObj.setUserStatus(targetStatus)
      }
      newList.push(dataObj)
    })
    setCurrentSearchData(newList)

    // Update in MAL DB using API call
    const fieldsToUpdate = {
      status: targetStatus,
    }
    if (malAccessToken) {
      const malApi = new MalApi(malAccessToken)
      const res = await malApi.updateList(animeId, fieldsToUpdate)

      if (200 === res.status) {
        console.log("success")
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch local user data")
    }
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
                <th scope="col">Change Status</th>
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
                          id={searchItem.id}
                          value={
                            userStatusReverseMap[searchItem.userStatus]
                              ? userStatusReverseMap[searchItem.userStatus]
                              : "not_added"
                          }
                          onChange={handleStatusChange}
                        >
                          <option value="not_added">Not Added</option>
                          {userStatusList.map((userStatus) => (
                            <option
                              key={userStatus.apiValue}
                              value={userStatus.apiValue}
                            >
                              {userStatus.pageTitle}
                            </option>
                          ))}
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
