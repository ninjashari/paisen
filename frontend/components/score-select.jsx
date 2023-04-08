import { useEffect, useState } from "react"

const ScoreSelect = ({ selectedVal }) => {
  const [scoreList, setScoreList] = useState([])
  const [selectedScore, setSelectedScore] = useState()

  useEffect(() => {
    const tempList = []
    for (var i = 0; i <= 10; i++) {
      const tempVar = {
        id: i,
        value: i,
      }
      tempList.push(tempVar)
    }
    setScoreList(tempList)
  }, [])

  const handleSelectedChange = (e) => {
    e.preventDefault()

    setSelectedScore(e.target.value)
    console.log(selectedScore)
  }

  return (
    <form>
      <div className="col-8">
        <select
          className="form-select"
          aria-label="Default select example"
          value={selectedVal}
          onChange={handleSelectedChange}
        >
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
