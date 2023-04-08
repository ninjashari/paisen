import { findUser, updateUser } from "@/lib/dbUtil"

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      const clientId = process.env.MAL_CLIENT_ID
      if (clientId) {
        res.status(201).json({
          success: true,
          data: {
            clientId: clientId,
          },
        })
      } else {
        res.status(400).json({
          success: false,
          message: "MAL Client ID not defined",
        })
      }
      break
    default:
      break
  }
}
