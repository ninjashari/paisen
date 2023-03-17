import express from "express"
import db from "../db/conn.mjs"

const router = express.Router()

// Get User details
router.post("/authenticate", async (req, res) => {
  const collection = await db.collection("users")
  const url = req.body.url

  console.log("url :: ", url)

  const response = await router.post(url)

  console.log("response :: ", response)
  res.send(user).status(204)
})

export default router