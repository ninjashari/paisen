import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

/**
 * Add a new user to DB
 * @param {Object} newUser User object to be added to DB
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
 * @param {String} username to get user using username
 * @returns
 */
export async function findUser(username) {
  await dbConnect()
  const user = await User.findOne({ username: username })
  return user
}

/**
 * Update user data stroed in DB
 * @param {String} username
 * @param {Object} userData
 * @returns
 */
export async function updateUser(username, userData) {
  await dbConnect()
  console.log(userData)
  const res = await User.updateOne({ username: username }, userData)
  return res
}
