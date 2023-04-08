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
