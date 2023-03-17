import express from "express"
import { closeClient, connectDB } from "../config/db.js"

const router = express.Router()

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
      console.log("result :: ", result)
      res.send(result).status(204)
    }
    closeClient()
  } catch (err) {
    console.error(`Error :: ${err.message}`.red.underline.bold)
    closeClient()
  }
})

// // Add a new user to the users collection
// router.post("/register", async (req, res) => {
//   let collection = await db.collection("users")
//   let user = await collection.findOne({ username: req.body.username })

//   if (user) {
//     res.send(user).status(409)
//   } else {
//     let newUser = {
//       username: req.body.username,
//       code: req.body.code,
//       codeChallenge: req.body.codeChallenge,
//       challengeVerifier: req.body.challengeVerifier,
//       dateCreated: new Date(),
//       dateModified: new Date(),
//     }
//     let result = await collection.insertOne(newUser)
//     console.log("result :: ", result)
//     res.send(result).status(204)
//   }
// })

// // Update the user with code value
// router.post("/update/", async (req, res) => {
//   const collection = await db.collection("users")
//   const filter = { username: req.body.username }
//   const options = { upsert: true }
//   const updateDoc = {
//     $set: {
//       code: req.body.code,
//       dateModified: new Date(),
//     },
//   }

//   const result = await collection.updateOne(filter, updateDoc, options)

//   console.log("result :: ", result)
//   res.send(result).status(204)
// })

// // Get User details
// router.post("/detail/", async (req, res) => {
//   const collection = await db.collection("users")
//   const filter = { username: req.body.username }

//   const user = await collection.findOne({ username: req.body.username })

//   console.log("user :: ", user)
//   res.send(user).status(204)
// })

export default router
