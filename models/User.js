import mongoose from 'mongoose'

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
  code: {
    type: String,
  },
  malUsername: {
    type: String,
  },
  codeChallenge: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  expiryTime: {
    type: Number,
  },
  refreshToken: {
    type: String,
  },
  tokenType: {
    type: String,
  },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
