/**
 * Hash a password in the browser before it goes over the network, so the raw
 * password never appears in the request payload. This is defense-in-depth on
 * top of TLS — the server still bcrypts the received value for storage.
 *
 * Uses the Web Crypto API (available in secure contexts: HTTPS and localhost).
 */
export async function hashClientPassword(password) {
  if (!password) return password

  if (typeof window === "undefined" || !window.crypto?.subtle) {
    // Web Crypto unavailable (non-secure context) — fall back to raw value so
    // auth still functions; TLS still protects it in transit.
    return password
  }

  const data = new TextEncoder().encode(password)
  const digest = await window.crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
