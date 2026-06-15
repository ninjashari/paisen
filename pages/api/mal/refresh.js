/**
 * Server-side MyAnimeList token refresh. Reads the stored refresh token for the
 * authenticated user and persists the new tokens.
 */
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { findUser, updateUser } from "@/lib/dbUtil"
import Mal from "@/lib/mal"

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

  const clientId = process.env.MAL_CLIENT_ID
  if (!clientId) {
    return res
      .status(500)
      .json({ success: false, message: "MAL client ID is not configured." })
  }

  try {
    const user = await findUser(session.user.username)
    if (!user || !user.refreshToken) {
      return res.status(400).json({
        success: false,
        message: "No refresh token found. Please authorize your account again.",
      })
    }

    const mal = new Mal(clientId)
    const response = await mal.refreshAccessToken(user.refreshToken)
    if (!response || !response.access_token) {
      return res.status(502).json({
        success: false,
        message: "Couldn't refresh access token from MyAnimeList.",
      })
    }

    await updateUser(user.username, {
      tokenType: response.token_type,
      refreshToken: response.refresh_token,
      expiryTime: response.expires_in,
      accessToken: response.access_token,
      modifiedAt: new Date(),
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error("[mal/refresh] failed:", err?.message)
    return res
      .status(500)
      .json({ success: false, message: "Token refresh failed." })
  }
}
