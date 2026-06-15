/**
 * Server-side proxy for updating a user's MyAnimeList list status
 * (status / score / episodes watched).
 */
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import MalApi from "@/lib/malApi"

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

  const { animeId, fields: fieldsToUpdate } = req.body
  if (!animeId || !fieldsToUpdate) {
    return res
      .status(400)
      .json({ success: false, message: "animeId and fields are required." })
  }

  try {
    const malApi = new MalApi(session.malAccessToken)
    const resp = await malApi.updateList(animeId, fieldsToUpdate)
    return res.status(200).json({ success: true, status: resp.status })
  } catch (err) {
    const status = err?.response?.status || 502
    console.error("[mal/update] failed:", status, err?.message)
    return res.status(status).json({
      success: false,
      message: "Failed to update your anime list on MyAnimeList.",
    })
  }
}
