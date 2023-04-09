import MalApi from "@/lib/malApi"
import { scoreList } from "@/utils/constants"
import { useEffect, useState } from "react"

const ScoreSelect = ({ selectedVal, animeID, malAccessToken, loading }) => {
  const [selectedScore, setSelectedScore] = useState()

  useEffect(() => {
    setSelectedScore(selectedVal)
  }, [])

  const handleSelectedChange = async (e) => {
    e.preventDefault()
    loading = true

    const scoreVal = e.target.value

    setSelectedScore(scoreVal)

    // Call MAL api to update
    const fieldsToUpdate = {
      score: scoreVal,
    }
    if (malAccessToken) {
      const malApi = new MalApi(malAccessToken)
      const res = await malApi.updateList(animeID, fieldsToUpdate)

      if (200 !== res.status) {
        alert("Couldn't update animelist with score")
      }
    } else {
      alert("Couldn't fetch access token from parent")
    }
  }

  return (
    <select
      className="form-select"
      aria-label="Default select example"
      value={selectedScore}
      onChange={handleSelectedChange}
    >
      {scoreList.map((score) => (
        <option key={score.score} value={score.score}>
          {score.value}
        </option>
      ))}
    </select>
  )
}

export default ScoreSelect
