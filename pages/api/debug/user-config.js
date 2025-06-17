/**
 * Debug User Configuration API Endpoint
 * 
 * This endpoint provides detailed information about the current user's
 * configuration including MAL tokens and Jellyfin settings for debugging purposes.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
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

  const username = session.user.username || session.user.name

  try {
    // Get user configuration
    const user = await User.findOne({ username })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check MAL token status
    const currentTime = Date.now()
    const tokenExpired = user.expiryTime && currentTime > user.expiryTime
    const tokenExpiresIn = user.expiryTime ? Math.max(0, user.expiryTime - currentTime) : null
    const tokenExpiresInHours = tokenExpiresIn ? Math.floor(tokenExpiresIn / (1000 * 60 * 60)) : null

    // Check Jellyfin configuration
    const jellyfinConfigured = !!(
      user.jellyfinServerUrl && 
      user.jellyfinApiKey && 
      user.jellyfinUserId
    )

    res.status(200).json({
      success: true,
      data: {
        user: {
          username: user.username,
          name: user.name,
          malUsername: user.malUsername
        },
        malToken: {
          hasAccessToken: !!user.accessToken,
          hasRefreshToken: !!user.refreshToken,
          tokenType: user.tokenType,
          expiryTime: user.expiryTime,
          expiryTimeFormatted: user.expiryTime ? new Date(user.expiryTime).toISOString() : null,
          currentTime: currentTime,
          currentTimeFormatted: new Date(currentTime).toISOString(),
          isExpired: tokenExpired,
          expiresInMs: tokenExpiresIn,
          expiresInHours: tokenExpiresInHours,
          accessTokenPreview: user.accessToken ? `${user.accessToken.substring(0, 10)}...` : null
        },
        jellyfin: {
          isConfigured: jellyfinConfigured,
          hasServerUrl: !!user.jellyfinServerUrl,
          hasApiKey: !!user.jellyfinApiKey,
          hasUserId: !!user.jellyfinUserId,
          hasUsername: !!user.jellyfinUsername,
          syncEnabled: user.jellyfinSyncEnabled,
          lastSync: user.jellyfinLastSync,
          serverUrlPreview: user.jellyfinServerUrl ? `${user.jellyfinServerUrl.substring(0, 20)}...` : null,
          apiKeyPreview: user.jellyfinApiKey ? `${user.jellyfinApiKey.substring(0, 10)}...` : null,
          userId: user.jellyfinUserId,
          username: user.jellyfinUsername
        },
        syncMetadata: {
          lastAnimeSync: user.syncMetadata?.lastAnimeSync,
          lastSyncStats: user.syncMetadata?.lastSyncStats,
          autoSyncEnabled: user.syncMetadata?.autoSyncEnabled,
          syncInterval: user.syncMetadata?.syncInterval
        }
      }
    })

  } catch (error) {
    console.error('User config debug error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
} 