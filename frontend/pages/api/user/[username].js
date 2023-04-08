import { findUser, updateUser } from "@/lib/dbUtil"

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      const { username } = req.query

      const userData = await findUser(username)

      if (userData) {
        res.status(201).json({
          success: true,
          userData,
        })
      } else {
        res.status(400).json({
          success: false,
          message: "Couldn't fetch user profile",
        })
      }
      break
    default:
      break
  }
}
