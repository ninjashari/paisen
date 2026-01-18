/**
 * Token Fix Script
 * 
 * This script fixes incorrect token expiry times in the database.
 * The expiry times seem to be stored as seconds instead of milliseconds.
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
})

const User = mongoose.model('User', UserSchema)

async function fixTokens() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    // Get users with access tokens
    const users = await User.find({ accessToken: { $exists: true, $ne: null } })
    console.log(`Found ${users.length} users with access tokens`)
    
    for (const user of users) {
      console.log(`\n--- Fixing User: ${user.username} ---`)
      
      if (user.expiryTime && user.expiryTime < 3000000000) { // If less than year 2065, it's likely in seconds
        const oldExpiry = new Date(user.expiryTime)
        
        // Set token to expire in 24 hours from now (typical MAL token lifetime)
        const newExpiryTime = Date.now() + (24 * 60 * 60 * 1000)
        const newExpiry = new Date(newExpiryTime)
        
        console.log(`Old expiry: ${oldExpiry.toISOString()}`)
        console.log(`New expiry: ${newExpiry.toISOString()}`)
        
        await User.findByIdAndUpdate(user._id, {
          expiryTime: newExpiryTime
        })
        
        console.log('✅ Updated expiry time')
      } else {
        console.log('Expiry time appears to be correct')
      }
    }
    
    console.log('\n✅ Token fix completed!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the fix
fixTokens() 