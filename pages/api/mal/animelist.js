/**
 * Server-side proxy for the MyAnimeList "user anime list" endpoint.
 * The browser cannot call MAL directly (no CORS), so it calls this route and
 * we attach the access token from the session here.
 */
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import MalApi from "@/lib/malApi"
import { fields, statisticsFields } from "@/utils/constants"

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

  try {
    const { status, scope } = req.query
    const fieldSet = scope === "statistics" ? statisticsFields : fields
    const malApi = new MalApi(session.malAccessToken)
    const resp = await malApi.getAnimeList(fieldSet, status || undefined)
    return res.status(200).json({ success: true, data: resp.data.data })
  } catch (err) {
    const status = err?.response?.status || 502
    console.error("[mal/animelist] failed:", status, err?.message)
    return res.status(status).json({
      success: false,
      message: "Failed to fetch your anime list from MyAnimeList.",
    })
  }
}
