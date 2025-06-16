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

    // Check if token is expired
    if (user.expiryTime && Date.now() > user.expiryTime) {
      return res.status(401).json({
        success: false,
        message: 'MAL access token has expired. Please re-authenticate.'
      })
    }

    // Initialize sync service
    const syncService = new AnimeSyncService(user._id, user.accessToken)

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