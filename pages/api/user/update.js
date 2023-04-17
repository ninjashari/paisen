import { findUser, updateUser } from "@/lib/dbUtil"

export default async function handler(req, res) {
  switch (req.method) {
    case "PUT":
      const updateUserData = req.body

      // Set date for user
      updateUserData.modifiedAt = new Date()

      // Store new user
      const storeUser = await updateUser(
        updateUserData.username,
        updateUserData
      )

      if (storeUser.acknowledged) {
        const userData = await findUser(updateUserData.username)

        res.status(201).json({
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
      break
  }
}
