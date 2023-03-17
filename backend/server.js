import express from "express"
import "./middleware/env.js"
import { errorHandler, notFound } from "./middleware/error.js"
import users from "./routes/users.js"

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.json())

// Load the /posts routes
app.use("/api/users", users)

// Error Handling
app.use(notFound)
app.use(errorHandler)

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`.yellow.underline)
})
