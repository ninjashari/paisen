/**
 * Database Current User API Endpoint
 * 
 * This endpoint provides information about the currently logged-in user,
 * including their anime count, sync status, and configuration details.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Anime from '@/models/Anime'

export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  const username = session.user.username || session.user.name

  try {
    // Connect to database
    await dbConnect()

    // Get current user information
    const user = await User.findOne({ username })
      .select('username jellyfinServerUrl jellyfinApiKey jellyfinUserId jellyfinLastSync accessToken createdAt')
      .lean()

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get user's anime count from their list status
    const userAnimeCount = await Anime.countDocuments({
      'userListStatus.userId': user._id
    })

    // Check if Jellyfin is configured
    const jellyfinConfigured = !!(
      user.jellyfinServerUrl && 
      user.jellyfinApiKey && 
      user.jellyfinUserId
    )

    // Check if MAL is configured
    const malConfigured = !!user.accessToken

    res.status(200).json({
      success: true,
      username: user.username,
      animeCount: userAnimeCount,
      lastSync: user.jellyfinLastSync,
      jellyfinConfigured,
      malConfigured,
      memberSince: user.createdAt,
      message: `Retrieved information for user: ${user.username}`
    })

  } catch (error) {
    console.error('Database current user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current user information',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
} 