/**
 * Browser-side helpers that call our same-origin MAL proxy routes.
 * These never see the MAL access token (the server attaches it). Each helper
 * throws an Error with a friendly message on failure so callers can surface it.
 */

async function handle(res) {
  let body = null
  try {
    body = await res.json()
  } catch {
    // non-JSON response
  }
  if (!res.ok || (body && body.success === false)) {
    throw new Error(body?.message || `Request failed (${res.status})`)
  }
  return body
}

export async function fetchAnimeList(status, scope) {
  const params = new URLSearchParams()
  if (status) params.set("status", status)
  if (scope) params.set("scope", scope)
  const res = await fetch(`/api/mal/animelist?${params.toString()}`)
  const body = await handle(res)
  return body.data
}

export async function searchAnime(query) {
  const res = await fetch(`/api/mal/search?q=${encodeURIComponent(query)}`)
  const body = await handle(res)
  return body.data
}

export async function updateAnime(animeId, fields) {
  const res = await fetch("/api/mal/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ animeId, fields }),
  })
  return handle(res)
}

export async function exchangeMalToken(code) {
  const res = await fetch("/api/mal/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
  return handle(res)
}

export async function refreshMalToken() {
  const res = await fetch("/api/mal/refresh", { method: "POST" })
  return handle(res)
}
