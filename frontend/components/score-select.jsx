import { useEffect, useState } from "react"

const ScoreSelect = () => {
  const [scoreList, setScoreList] = useState([])

  useEffect(() => {
    const tempList = []
    for (var i = 1; i <= 10; i++) {
      const tempVar = {
        id: i,
        value: i,
      }
      tempList.push(tempVar)
    }
    setScoreList(tempList)
  }, [])

  return (
    <form>
      <div className="col-8">
        <select className="form-select" aria-label="Default select example">
          {scoreList.map((score, index) => (
            <option key={index} value={score.value}>
              {score.value}
            </option>
          ))}
        </select>
      </div>
    </form>
  )
}

export default ScoreSelect
