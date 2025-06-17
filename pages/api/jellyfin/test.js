/**
 * Jellyfin Connection Test API Endpoint
 * 
 * This endpoint tests the Jellyfin connection using the current user's
 * stored configuration without exposing sensitive credentials.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import JellyfinApi from '@/lib/jellyfin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  // Connect to database
  await dbConnect()

  // Get user session
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  // Try both username and name fields for compatibility
  const username = session.user.username || session.user.name
  
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Username not found in session'
    })
  }

  try {
    console.log('Testing Jellyfin connection for user:', username)
    const user = await User.findOne({ username })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if Jellyfin is configured
    if (!user.jellyfinServerUrl || !user.jellyfinApiKey || !user.jellyfinUserId) {
      return res.status(400).json({
        success: false,
        message: 'Jellyfin is not properly configured'
      })
    }

    // Test connection using stored credentials
    const jellyfinApi = new JellyfinApi(user.jellyfinServerUrl, user.jellyfinApiKey)
    
    // Test server connection
    const connectionTest = await jellyfinApi.testConnection()
    
    // Get user info
    let userInfo = null
    try {
      userInfo = await jellyfinApi.getUserById(user.jellyfinUserId)
    } catch (error) {
      console.warn('Could not fetch user info:', error.message)
    }

    res.status(200).json({
      success: true,
      message: 'Connection test successful',
      serverInfo: {
        name: connectionTest.serverName,
        version: connectionTest.version,
        id: connectionTest.id
      },
      userInfo: userInfo ? {
        name: userInfo.Name,
        id: userInfo.Id,
        lastActivityDate: userInfo.LastActivityDate,
        lastLoginDate: userInfo.LastLoginDate
      } : null,
      lastSync: user.jellyfinLastSync
    })

  } catch (error) {
    console.error('Jellyfin connection test failed:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Connection test failed'
    })
  }
} 