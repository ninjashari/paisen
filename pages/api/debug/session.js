/**
 * Debug Session Endpoint
 * 
 * This endpoint helps debug session and user lookup issues
 * by showing what data is available in the session and database.
 * 
 * IMPORTANT: Remove this endpoint in production!
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export default async function handler(req, res) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' })
  }

  await dbConnect()

  try {
    // Get session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(200).json({
        session: null,
        message: 'No session found'
      })
    }

    // Try to find user
    const username = session.user.username || session.user.name
    const user = await User.findOne({ username })

    // Get all users for comparison
    const allUsers = await User.find({}, { username: 1, name: 1, _id: 1 })

    res.status(200).json({
      session: {
        user: session.user,
        extractedUsername: username
      },
      userFound: !!user,
      userDetails: user ? {
        username: user.username,
        name: user.name,
        hasJellyfinConfig: !!(user.jellyfinServerUrl && user.jellyfinApiKey)
      } : null,
      allUsers: allUsers.map(u => ({
        username: u.username,
        name: u.name,
        id: u._id
      })),
      debug: {
        sessionUserKeys: Object.keys(session.user || {}),
        lookupField: username,
        totalUsers: allUsers.length
      }
    })

  } catch (error) {
    console.error('Debug session error:', error)
    res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
} 