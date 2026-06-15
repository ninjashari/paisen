/**
 * Server-side MyAnimeList OAuth code -> token exchange.
 * Reads the stored PKCE verifier (codeChallenge, plain method) for the
 * authenticated user and persists the resulting tokens.
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

  const { code } = req.body
  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "Authorization code is required." })
  }

  const clientId = process.env.MAL_CLIENT_ID
  if (!clientId) {
    return res
      .status(500)
      .json({ success: false, message: "MAL client ID is not configured." })
  }

  try {
    const user = await findUser(session.user.username)
    if (!user || !user.codeChallenge) {
      return res.status(400).json({
        success: false,
        message: "Missing PKCE challenge. Please start authorization again.",
      })
    }

    const mal = new Mal(clientId)
    const response = await mal.generateAccessToken(code, user.codeChallenge)
    if (!response || !response.access_token) {
      return res.status(502).json({
        success: false,
        message: "Couldn't generate access token from MyAnimeList.",
      })
    }

    await updateUser(user.username, {
      code,
      tokenType: response.token_type,
      refreshToken: response.refresh_token,
      expiryTime: response.expires_in,
      accessToken: response.access_token,
      modifiedAt: new Date(),
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error("[mal/token] failed:", err?.message)
    return res
      .status(500)
      .json({ success: false, message: "Token exchange failed." })
  }
}
