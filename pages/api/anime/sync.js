/**
 * Anime Sync API Endpoint
 * 
 * This endpoint handles synchronization of user's MyAnimeList anime data
 * to the local database, including external ID mappings.
 * 
 * Supported operations:
 * - Full sync of user's anime list
 * - Incremental sync with options
 * - Sync statistics retrieval
 */

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import AnimeSyncService from '@/lib/animeSyncService'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import axios from 'axios'

export default async function handler(req, res) {
  const { method } = req

  // Connect to database
  await dbConnect()

  // Get session for authentication
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  const username = session.user.username || session.user.name
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Username not found in session'
    })
  }

  switch (method) {
    case 'POST':
      return handleSyncRequest(req, res, username)
    case 'GET':
      return handleGetSyncStats(req, res, username)
    default:
      res.setHeader('Allow', ['POST', 'GET'])
      return res.status(405).json({ 
        success: false, 
        message: `Method ${method} Not Allowed` 
      })
  }
}

/**
 * Handle anime sync request
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} username - Username from session
 */
async function handleSyncRequest(req, res, username) {
  try {
    const { 
      includeExternalIds = true, 
      forceUpdate = false,
      statusFilter = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']
    } = req.body

    // Get user and validate MAL access token
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.accessToken) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a valid MAL access token'
      })
    }

    // Check if token is expired (with some buffer time)
    const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
    if (user.expiryTime && Date.now() > (user.expiryTime + bufferTime)) {
      // Try to refresh the token first if we have a refresh token
      if (user.refreshToken) {
        try {
          const refreshResult = await refreshMalToken(user)
          if (refreshResult.success) {
            // Update user with new token
            await User.findByIdAndUpdate(user._id, {
              accessToken: refreshResult.accessToken,
              expiryTime: refreshResult.expiryTime,
              refreshToken: refreshResult.refreshToken || user.refreshToken
            })
            // Update user object for this request
            user.accessToken = refreshResult.accessToken
            user.expiryTime = refreshResult.expiryTime
          } else {
            return res.status(401).json({
              success: false,
              message: 'MAL access token has expired and refresh failed. Please re-authenticate.'
            })
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          return res.status(401).json({
            success: false,
            message: 'MAL access token has expired and refresh failed. Please re-authenticate.'
          })
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'MAL access token has expired. Please re-authenticate.'
        })
      }
    }

    // Generate session ID for progress tracking
    const sessionId = `sync_${user._id}_${Date.now()}`
    
    // Initialize sync service with progress tracking
    const syncService = new AnimeSyncService(user._id, user.accessToken, sessionId)

    // Perform sync
    const syncResult = await syncService.syncUserAnimeList({
      includeExternalIds,
      forceUpdate,
      statusFilter
    })

    if (syncResult.success) {
      return res.status(200).json({
        success: true,
        message: syncResult.message,
        stats: syncResult.stats,
        timestamp: new Date().toISOString()
      })
    } else {
      return res.status(500).json({
        success: false,
        message: syncResult.error || 'Sync failed',
        stats: syncResult.stats
      })
    }

  } catch (error) {
    console.error('Anime sync API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during sync',
      error: error.message
    })
  }
}

/**
 * Handle sync statistics request
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} username - Username from session
 */
async function handleGetSyncStats(req, res, username) {
  try {
    // Get user and validate
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.accessToken) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a valid MAL access token'
      })
    }

    // Initialize sync service and get stats
    const syncService = new AnimeSyncService(user._id, user.accessToken)
    const stats = await syncService.getSyncStats()

    if (stats.error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve sync statistics',
        error: stats.error
      })
    }

    return res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sync stats API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving sync statistics',
      error: error.message
    })
  }
}

/**
 * Refresh MAL access token using refresh token
 * 
 * @param {Object} user - User document
 * @returns {Promise<Object>} Refresh result
 */
async function refreshMalToken(user) {
  try {
    const response = await axios.post('https://myanimelist.net/v1/oauth2/token', {
      client_id: process.env.MAL_CLIENT_ID,
      client_secret: process.env.MAL_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: user.refreshToken
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const tokenData = response.data
    const expiryTime = Date.now() + (tokenData.expires_in * 1000)

    return {
      success: true,
      accessToken: tokenData.access_token,
      expiryTime: expiryTime,
      refreshToken: tokenData.refresh_token
    }
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error || error.message
    }
  }
} 