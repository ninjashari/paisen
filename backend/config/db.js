import { MongoClient } from "mongodb"
import colors from "colors"

const connectionString = process.env.ATLAS_URI || ""

const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

export const connectDB = async (collection) => {
  try {
    const conn = await client.connect()
    const db = conn.db("paibit")
    const coll = db.collection(collection)

    console.log("MongoDB Connected".cyan.underline.bold)

    return collection
  } catch (err) {
    console.error(`Error :: ${err.message}`.red.underline.bold)
    process.exit(1)
  }
}

export const closeClient = () => {
  client.close()
  console.log("Client Disconnected".green.underline.bold)
}
