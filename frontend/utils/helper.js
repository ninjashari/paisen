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
