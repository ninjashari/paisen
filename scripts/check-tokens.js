/**
 * Token Check Script
 * 
 * This script checks the current state of MAL tokens in the database
 * for debugging token expiry issues.
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// User model
const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  modifiedAt: Date,
  createdAt: Date,
  code: String,
  malUsername: String,
  codeChallenge: String,
  accessToken: String,
  expiryTime: Number,
  refreshToken: String,
  tokenType: String,
  jellyfinServerUrl: String,
  jellyfinApiKey: String,
  jellyfinUserId: String,
  jellyfinUsername: String,
  jellyfinSyncEnabled: { type: Boolean, default: false },
  jellyfinLastSync: Date,
  syncMetadata: {
    lastAnimeSync: Date,
    lastSyncStats: {
      processed: { type: Number, default: 0 },
      created: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
    },
    autoSyncEnabled: { type: Boolean, default: false },
    syncInterval: { type: Number, default: 24 },
  },
})

const User = mongoose.model('User', UserSchema)

async function checkTokens() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    // Get all users
    const users = await User.find({})
    console.log(`Found ${users.length} users`)
    
    const currentTime = Date.now()
    
    for (const user of users) {
      console.log(`\n--- User: ${user.username} ---`)
      console.log(`Name: ${user.name}`)
      console.log(`MAL Username: ${user.malUsername || 'Not set'}`)
      
      if (user.accessToken) {
        console.log(`Access Token: ${user.accessToken.substring(0, 20)}...`)
        console.log(`Token Type: ${user.tokenType || 'Not set'}`)
        
        if (user.expiryTime) {
          const expiryDate = new Date(user.expiryTime)
          const isExpired = currentTime > user.expiryTime
          const timeUntilExpiry = user.expiryTime - currentTime
          const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60))
          
          console.log(`Expiry Time: ${expiryDate.toISOString()}`)
          console.log(`Current Time: ${new Date(currentTime).toISOString()}`)
          console.log(`Is Expired: ${isExpired}`)
          console.log(`Hours until expiry: ${hoursUntilExpiry}`)
        } else {
          console.log('No expiry time set')
        }
        
        console.log(`Has Refresh Token: ${!!user.refreshToken}`)
        if (user.refreshToken) {
          console.log(`Refresh Token: ${user.refreshToken.substring(0, 20)}...`)
        }
      } else {
        console.log('No access token')
      }
      
      // Jellyfin config
      console.log('\nJellyfin Configuration:')
      console.log(`Server URL: ${user.jellyfinServerUrl || 'Not set'}`)
      console.log(`API Key: ${user.jellyfinApiKey ? `${user.jellyfinApiKey.substring(0, 10)}...` : 'Not set'}`)
      console.log(`User ID: ${user.jellyfinUserId || 'Not set'}`)
      console.log(`Username: ${user.jellyfinUsername || 'Not set'}`)
      console.log(`Sync Enabled: ${user.jellyfinSyncEnabled}`)
      console.log(`Last Sync: ${user.jellyfinLastSync || 'Never'}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the check
checkTokens() 