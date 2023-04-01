import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

/**
 * Add a new user to DB
 * @param {User object to be added to DB} newUser
 * @returns
 */
export async function createUser(newUser) {
  await dbConnect()

  const user = new User(newUser)
  const res = await user.save()

  return res
}

/**
 * Find the user which has provied username
 * @param {username to get user} username
 * @returns
 */
export async function findUser(username) {
  await dbConnect()

  const user = await User.findOne({ username: username })

  return user
}
