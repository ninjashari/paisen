import cors from "cors"
import express from "express"
import "express-async-errors"
import "./loadEnvironment.mjs"
import users from "./routes/users.mjs"
import mal from "./routes/mal.mjs"

const PORT = process.env.PORT || 5050
const app = express()

app.use(cors())
app.use(express.json())

// Load the /posts routes
app.use("/api/users", users)
app.use("/api/mal", mal)

// Global error handling
app.use((err, _req, res, next) => {
  console.log(err)
  res.status(500).send("Uh oh! An unexpected error occured.")
})

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})
