export const getURILastValue = (uri) => {
  if (uri) {
    const valueArr = uri.split("/")
    const lastVal = valueArr[valueArr.length - 1]
    return lastVal
  }
  return undefined
}
