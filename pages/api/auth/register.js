import { createUser, findUser } from "@/lib/dbUtil"
import { hashPassword } from "@/utils/hash"

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      // Whitelist accepted fields to prevent mass assignment (e.g. a client
      // setting accessToken/refreshToken or other privileged fields directly).
      const { name, username, password } = req.body

      if (!name || !username || !password) {
        res.status(400).json({
          success: false,
          message: "Name, username and password are required.",
        })
        return
      }

      // Check if username exists
      const userExists = await findUser(username)

      if (userExists) {
        res.status(422).json({
          success: false,
          message: "Username already in use. Please try another username!",
          userExists: true,
        })
        return
      }

      // Hash the password server-side. The raw password must never be stored.
      const hashedPassword = await hashPassword(password)

      const addUser = {
        name,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        modifiedAt: new Date(),
      }

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
      res.status(405).json({ success: false, message: "Invalid method" })
      break
  }
}
