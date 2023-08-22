import { createUser, findUser } from "@/lib/dbUtil"

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      const addUser = req.body
      console.log("addUser :: ", addUser)

      // Check if username exists
      const userExists = await findUser(addUser.username)
      console.log("userExists :: ", userExists)

      if (userExists) {
        res.status(422).json({
          success: false,
          message: "Username already in use. Please try another username!",
          userExists: true,
        })
        return
      }

      // Set date for user
      addUser.createdAt = new Date()
      addUser.modifiedAt = new Date()

      // Store new user
      const storeUser = await createUser(addUser)
      if (storeUser) {
        res.status(201).json({
          success: true,
          data: {
            name: storeUser.name,
            username: storeUser.username,
          },
        })
      } else {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false, message: "Invalid method" })
      break
  }
}
