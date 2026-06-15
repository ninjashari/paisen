const contentType = "application/json"

export const getClientId = async () => {
  const res = await fetch("/api/mal/clientid")
  if (res.ok) {
    const resp = await res.json()
    if (resp && resp.data && resp.data.clientId) {
      const clientID = resp.data.clientId
      return clientID
    }
  }
  return undefined
}

export const updateUserData = async (userData) => {
  const res = await fetch("/api/user/update", {
    method: "PUT",
    headers: {
      Accept: contentType,
      "Content-Type": contentType,
    },
    body: JSON.stringify(userData),
  })

  if (res.ok) {
    return true
  }
  return false
}
