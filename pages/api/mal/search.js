/**
 * Server-side proxy for the MyAnimeList anime search endpoint.
 */
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import MalApi from "@/lib/malApi"
import { fields } from "@/utils/constants"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" })
  }
  if (!session.malAccessToken) {
    return res.status(400).json({
      success: false,
      message: "Authorize your MyAnimeList account to continue.",
    })
  }

  const { q } = req.query
  if (!q) {
    return res
      .status(400)
      .json({ success: false, message: "A search query is required." })
  }

  try {
    const malApi = new MalApi(session.malAccessToken)
    const resp = await malApi.getSearchAnimeList(q, fields)
    // Unwrap the { node } envelope MAL returns for each result.
    const data = (resp.data.data || []).map((item) => item.node)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    const status = err?.response?.status || 502
    console.error("[mal/search] failed:", status, err?.message)
    return res.status(status).json({
      success: false,
      message: "Failed to search MyAnimeList.",
    })
  }
}
