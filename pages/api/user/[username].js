import { findUser } from "@/lib/dbUtil"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      // Require an authenticated session.
      const session = await getServerSession(req, res, authOptions)
      if (!session || !session.user) {
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" })
      }

      const { username } = req.query

      // A user may only read their own record (prevents IDOR / fetching
      // other users' password hashes and MAL tokens).
      if (username !== session.user.username) {
        return res.status(403).json({ success: false, message: "Forbidden" })
      }

      const userData = await findUser(username)

      if (userData) {
        // Never expose the password hash to the client.
        const { password, ...safeUserData } = userData.toObject()
        res.status(200).json({
          success: true,
          userData: safeUserData,
        })
      } else {
        res.status(404).json({
          success: false,
          message: "Couldn't fetch user profile",
        })
      }
      break
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).json({ success: false, message: "Method not allowed" })
      break
  }
}
