import MalApi from "@/lib/malApi"
import { scoreList } from "@/utils/constants"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const ScoreSelect = ({ selectedVal, animeID, malAccessToken }) => {
  const [selectedScore, setSelectedScore] = useState()

  useEffect(() => {
    setSelectedScore(selectedVal)
  }, [])

  const handleSelectedChange = async (e) => {
    e.preventDefault()

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
      aria-label="Score"
      value={selectedScore}
      onChange={handleSelectedChange}
      className={cn(
        "border-input bg-background dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-16 rounded-md border px-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
      )}
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
