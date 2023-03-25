import React, { useEffect, useState } from "react"

const ScoreSelect = () => {
  const [scoreList, setScoreList] = useState([])

  useEffect(() => {
    const tempList = []
    for (var i = 1; i <= 10; i++) {
      const tempVar = {
        value: i,
      }
      tempList.push(tempVar)
    }
    setScoreList(tempList)
  }, [])

  return (
    <form>
      <div className="col-5">
        <select class="form-select" aria-label="Default select example">
          {scoreList.map((score) => (
            <option value={score.value.toString()}>
              {score.value.toString()}
            </option>
          ))}
        </select>
      </div>
    </form>
  )
}

export default ScoreSelect
