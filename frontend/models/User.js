import mongoose from "mongoose"

// UserSchema will correspond to a collection in your MongoDB database.
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 60,
  },
  username: {
    type: String,
    required: true,
    maxlength: 32,
  },
  password: {
    type: String,
    required: true,
  },
  modifiedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
})

export default mongoose.models.User || mongoose.model("User", UserSchema)
