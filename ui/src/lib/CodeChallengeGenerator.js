function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  return window.crypto.subtle.digest("SHA-256", data).then((buffer) => {
    const hash = btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
    return hash
  })
}

export default generateCodeChallenge
