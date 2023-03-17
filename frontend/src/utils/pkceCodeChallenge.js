export const generateCodeChallenge = (codeVerifier) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  return crypto.subtle.digest("SHA-256", data).then((buffer) => {
    const hashArray = Array.from(new Uint8Array(buffer))
    const hashHex = hashArray
      .map((b) => ("00" + b.toString(16)).slice(-2))
      .join("")
    return btoa(hashHex)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  })
}

export const generateCodeVerifier = (length = 128) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  let codeVerifier = ""
  for (let i = 0; i < length; i++) {
    codeVerifier += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return codeVerifier
}
