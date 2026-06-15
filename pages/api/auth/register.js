import { createUser, findUser } from "@/lib/dbUtil"
import { hashPassword } from "@/utils/hash"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Invalid method" })
  }

  // Whitelist accepted fields to prevent mass assignment (e.g. a client
  // setting accessToken/refreshToken or other privileged fields directly).
  const { name, username, password } = req.body

  if (!name || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, username and password are required.",
    })
  }

  try {
    // Check if username exists
    const userExists = await findUser(username)

    if (userExists) {
      return res.status(422).json({
        success: false,
        message: "Username already in use. Please try another username!",
        userExists: true,
      })
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
      return res.status(201).json({
        success: true,
        data: {
          name: storeUser.name,
          username: storeUser.username,
        },
      })
    }

    return res
      .status(400)
      .json({ success: false, message: "Couldn't create user." })
  } catch (err) {
    // Most commonly a database connectivity error (Atlas IP allowlist, paused
    // cluster, or SRV/DNS issue). Surface it instead of an opaque 500.
    console.error("[register] failed:", err)
    return res.status(500).json({
      success: false,
      message: `Registration failed: ${err.message}`,
    })
  }
}
