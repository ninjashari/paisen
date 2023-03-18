import express from "express"
import { closeClient, connectDB } from "../config/db.js"

const router = express.Router()

// Add a new user to the users collection
router.post("/register", async (req, res) => {
  try {
    const collection = await connectDB("users")
    const user = await collection.findOne({ username: req.body.username })

    if (user) {
      res.send(user).status(409)
    } else {
      let newUser = {
        username: req.body.username,
        code: req.body.code,
        codeChallenge: req.body.codeChallenge,
        challengeVerifier: req.body.challengeVerifier,
        dateCreated: new Date(),
        dateModified: new Date(),
      }
      let result = await collection.insertOne(newUser)
      res.send(result).status(204)
    }
    closeClient()
  } catch (err) {
    console.error(`Error :: ${err.message}`.red.underline.bold)
    closeClient()
  }
})

// Update the user with code value
router.post("/update", async (req, res) => {
  try {
    const collection = await connectDB("users")
    const filter = { username: req.body.username }
    const options = { upsert: true }
    const updateDoc = {
      $set: {
        code: req.body.code,
        dateModified: new Date(),
        accessToken: req.body.accessToken,
        expiryTime: req.body.expiryTime,
        refreshToken: req.body.refreshToken,
        tokenType: req.body.tokenType,
      },
    }

    const result = await collection.updateOne(filter, updateDoc, options)
    res.send(result).status(204)
    closeClient()
  } catch (err) {
    console.error(`Error :: ${err.message}`)
    closeClient()
  }
})

// Get User details
router.post("/detail", async (req, res) => {
  try {
    const collection = await connectDB("users")
    const user = await collection.findOne({ username: req.body.username })

    if (user) {
      res.send(user).status(204)
    } else {
      res
        .send({
          message: "User not found",
        })
        .status(404)
    }
    closeClient()
  } catch (err) {
    console.error(`Error :: ${err.message}`)
    closeClient()
  }
})

export default router
