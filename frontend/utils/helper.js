import Anime from "@/lib/anime"

export const camelize = (str) => {
  if (str) {
    return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
      return str.toUpperCase()
    })
  } else {
    return ""
  }
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

  let scoreData = []
  for (var i = 10; i > 0; i--) {
    scoreData.push(scoreMap[i])
  }

  return scoreData
}

export const getWachedPercentage = (watched, total) => {
  if (watched && total) {
    return (
      Math.ceil((parseInt(watched) / parseInt(total)) * 100).toString() + "%"
    )
  } else {
    return "0%"
  }
}

export const getAnimeObj = (animeList) => {
  let dataList = []
  animeList.forEach((anime) => {
    const node = anime.node
    let animeObj = new Anime(
      node.alternative_titles,
      node.average_episode_duration,
      node.end_date,
      node.genres,
      node.id,
      node.main_picture,
      node.mean,
      node.media_type,
      node.my_list_status,
      node.num_episodes,
      node.rating,
      node.source,
      node.start_date,
      node.start_season,
      node.status,
      node.synopsis,
      node.title
    )
    dataList.push(animeObj)
  })

  return dataList
}
