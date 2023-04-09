import { scoreList } from "@/utils/constants"
import { useEffect, useState } from "react"

const ScoreSelect = ({ selectedVal }) => {
  const [selectedScore, setSelectedScore] = useState()

  useEffect(() => {
    setSelectedScore(selectedVal)
  }, [])

  const handleSelectedChange = (e) => {
    e.preventDefault()

    setSelectedScore(e.target.value)

    // Call MAL api to update
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
