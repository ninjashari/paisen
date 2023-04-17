const contentType = "application/json"

export const getUserAccessToken = async (session) => {
  if (session) {
    const userResponse = await fetch("/api/user/" + session?.user?.username)
    const userRes = await userResponse.json()
    const currentUserData = userRes.userData
    return currentUserData.accessToken
  }
  return undefined
}

export const getUserRefreshToken = async (session) => {
  if (session) {
    const userResponse = await fetch("/api/user/" + session?.user?.username)
    const userRes = await userResponse.json()
    const currentUserData = userRes.userData
    return currentUserData.refreshToken
  }
  return undefined
}

export const getUserData = async (session) => {
  if (session) {
    const userResponse = await fetch("/api/user/" + session?.user?.username)
    const userRes = await userResponse.json()
    const currentUserData = userRes.userData
    return currentUserData
  }
  return undefined
}

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
