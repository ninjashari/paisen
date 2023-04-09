export const getUserAccessToken = async (session) => {
  if (session) {
    const userResponse = await fetch("/api/user/" + session?.user?.username)
    const userRes = await userResponse.json()
    const currentUserData = userRes.userData
    return currentUserData.accessToken
  }
  return undefined
}
