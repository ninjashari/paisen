import { findUser, updateUser } from "@/lib/dbUtil"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

// Only these fields may be updated through this endpoint. This prevents mass
// assignment (e.g. an attacker overwriting `password`, `name`, or `username`).
const ALLOWED_FIELDS = [
  "malUsername",
  "codeChallenge",
  "code",
  "tokenType",
  "refreshToken",
  "expiryTime",
  "accessToken",
]

export default async function handler(req, res) {
  switch (req.method) {
    case "PUT":
      // Require an authenticated session.
      const session = await getServerSession(req, res, authOptions)
      if (!session || !session.user) {
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" })
      }

      // Always target the authenticated user's own record — ignore any
      // username supplied in the body (prevents updating other accounts).
      const username = session.user.username

      // Whitelist the updatable fields.
      const updateUserData = { modifiedAt: new Date() }
      for (const field of ALLOWED_FIELDS) {
        if (req.body[field] !== undefined) {
          updateUserData[field] = req.body[field]
        }
      }

      const storeUser = await updateUser(username, updateUserData)

      if (storeUser.acknowledged) {
        const userData = await findUser(username)

        res.status(200).json({
          success: true,
          data: {
            name: userData.name,
            username: userData.username,
            codeChallenge: userData.codeChallenge,
            code: userData.code,
          },
        })
      } else {
        res.status(400).json({
          success: false,
          message: "Couldn't add details to user profile",
        })
      }
      break
    default:
      res.setHeader("Allow", ["PUT"])
      res.status(405).json({ success: false, message: "Method not allowed" })
      break
  }
}
