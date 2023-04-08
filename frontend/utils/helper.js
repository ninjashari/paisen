export const camelize = (str) => {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase()
  })
}

export const getQueryParams = (url) => {
  const paramArr = url.slice(url.indexOf("?") + 1).split("&")
  const params = {}
  paramArr.map((param) => {
    const [key, val] = param.split("=")
    params[key] = decodeURIComponent(val)
  })
  return params
}

export const convertToDaysHrsMins = (days) => {
  const daysFinal = Math.floor(days)
  const remDays = days - daysFinal
  const hrs = Math.floor(remDays * 24)
  const remHrs = remDays * 24 - hrs
  const mins = Math.ceil(remHrs * 60)
  return daysFinal + " days " + hrs + " hours " + mins + " minutes"
}

export const createDataArray = (scoreArray) => {
  let scoreMap = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
  }

  scoreArray.forEach((element) => {
    scoreMap[element] += 1
  })

  console.log(scoreMap)

  let scoreData = []
  for (var i = 10; i > 0; i--) {
    console.log(scoreMap[i])
    scoreData.push(scoreMap[i])
  }
  console.log(scoreData)

  return scoreData
}
