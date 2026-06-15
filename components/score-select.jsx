import { updateAnime } from "@/utils/malClient"
import { scoreList } from "@/utils/constants"
import { toast } from "sonner"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const ScoreSelect = ({ selectedVal, animeID }) => {
  const [selectedScore, setSelectedScore] = useState()

  useEffect(() => {
    setSelectedScore(selectedVal)
  }, [])

  const handleSelectedChange = async (e) => {
    e.preventDefault()

    const scoreVal = e.target.value

    setSelectedScore(scoreVal)

    // Call MAL api to update
    try {
      await updateAnime(animeID, { score: scoreVal })
    } catch (err) {
      console.error("Failed to update score:", err)
      toast.error(err.message || "Couldn't update score")
    }
  }

  return (
    <select
      aria-label="Score"
      value={selectedScore}
      onChange={handleSelectedChange}
      className={cn(
        "border-input bg-background dark:bg-input/30 dark:[color-scheme:dark] focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-16 rounded-md border px-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
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
