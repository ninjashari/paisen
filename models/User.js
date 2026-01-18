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

  // Anime Sync Metadata
  syncMetadata: {
    lastAnimeSync: {
      type: Date,
    },
    lastSyncStats: {
      processed: { type: Number, default: 0 },
      created: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
    },
    autoSyncEnabled: {
      type: Boolean,
      default: false,
    },
    syncInterval: {
      type: Number,
      default: 24, // hours
    },
  },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
