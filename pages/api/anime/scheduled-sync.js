/**
 * Scheduled Anime Sync API Endpoint
 * 
 * This endpoint handles automated/scheduled synchronization of anime data.
 * It can be called by cron jobs, background processes, or webhooks to keep
 * the local anime database up-to-date with MyAnimeList.
 * 
 * Features:
 * - Sync all users with auto-sync enabled
 * - Sync specific users based on schedule
 * - Handle sync errors and retries
 * - Rate limiting to avoid API abuse
 */

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import AnimeSyncService from '@/lib/animeSyncService'

export default async function handler(req, res) {
  const { method } = req

  // Connect to database
  await dbConnect()

  switch (method) {
    case 'POST':
      return handleScheduledSync(req, res)
    case 'GET':
      return handleGetScheduledSyncStatus(req, res)
    default:
      res.setHeader('Allow', ['POST', 'GET'])
      return res.status(405).json({ 
        success: false, 
        message: `Method ${method} Not Allowed` 
      })
  }
}

/**
 * Handle scheduled sync request
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handleScheduledSync(req, res) {
  try {
    const { 
      syncKey,
      forceSync = false,
      maxUsers = 10,
      includeExternalIds = true
    } = req.body

    // Basic security check (you should implement proper authentication)
    const expectedSyncKey = process.env.SYNC_KEY || 'default-sync-key'
    if (syncKey !== expectedSyncKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid sync key'
      })
    }

    console.log('Starting scheduled anime sync...')

    // Find users that need syncing
    const usersToSync = await findUsersNeedingSync(maxUsers, forceSync)
    
    if (usersToSync.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users need syncing at this time',
        syncResults: []
      })
    }

    console.log(`Found ${usersToSync.length} users to sync`)

    const syncResults = []
    let successCount = 0
    let errorCount = 0

    // Process each user
    for (const user of usersToSync) {
      try {
        console.log(`Syncing user: ${user.username} (${user._id})`)
        
        // Check if user has valid access token
        if (!user.accessToken) {
          console.log(`Skipping user ${user.username} - no access token`)
          syncResults.push({
            userId: user._id,
            username: user.username,
            success: false,
            error: 'No access token available'
          })
          errorCount++
          continue
        }

        // Check if token is expired
        if (user.expiryTime && Date.now() > user.expiryTime) {
          console.log(`Skipping user ${user.username} - token expired`)
          syncResults.push({
            userId: user._id,
            username: user.username,
            success: false,
            error: 'Access token expired'
          })
          errorCount++
          continue
        }

        // Initialize sync service
        const syncService = new AnimeSyncService(user._id, user.accessToken)

        // Perform sync with rate limiting
        const syncResult = await syncService.syncUserAnimeList({
          includeExternalIds,
          forceUpdate: forceSync,
          statusFilter: ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']
        })

        syncResults.push({
          userId: user._id,
          username: user.username,
          success: syncResult.success,
          stats: syncResult.stats,
          message: syncResult.message,
          error: syncResult.error
        })

        if (syncResult.success) {
          successCount++
        } else {
          errorCount++
        }

        // Rate limiting - wait between users to avoid overwhelming MAL API
        if (usersToSync.indexOf(user) < usersToSync.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
        }

      } catch (error) {
        console.error(`Error syncing user ${user.username}:`, error)
        syncResults.push({
          userId: user._id,
          username: user.username,
          success: false,
          error: error.message
        })
        errorCount++
      }
    }

    console.log(`Scheduled sync completed: ${successCount} success, ${errorCount} errors`)

    return res.status(200).json({
      success: true,
      message: `Scheduled sync completed: ${successCount} users synced successfully, ${errorCount} errors`,
      syncResults,
      summary: {
        totalUsers: usersToSync.length,
        successCount,
        errorCount
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Scheduled sync error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during scheduled sync',
      error: error.message
    })
  }
}

/**
 * Handle scheduled sync status request
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handleGetScheduledSyncStatus(req, res) {
  try {
    const { syncKey } = req.query

    // Basic security check
    const expectedSyncKey = process.env.SYNC_KEY || 'default-sync-key'
    if (syncKey !== expectedSyncKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid sync key'
      })
    }

    // Get users with auto-sync enabled
    const autoSyncUsers = await User.countDocuments({
      'syncMetadata.autoSyncEnabled': true,
      accessToken: { $exists: true, $ne: null }
    })

    // Get users that need syncing
    const usersNeedingSync = await findUsersNeedingSync(100, false)

    // Get recent sync statistics
    const recentSyncs = await User.aggregate([
      {
        $match: {
          'syncMetadata.lastAnimeSync': { 
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSyncs: { $sum: 1 },
          totalProcessed: { $sum: '$syncMetadata.lastSyncStats.processed' },
          totalCreated: { $sum: '$syncMetadata.lastSyncStats.created' },
          totalUpdated: { $sum: '$syncMetadata.lastSyncStats.updated' },
          totalErrors: { $sum: '$syncMetadata.lastSyncStats.errors' }
        }
      }
    ])

    const syncStats = recentSyncs.length > 0 ? recentSyncs[0] : {
      totalSyncs: 0,
      totalProcessed: 0,
      totalCreated: 0,
      totalUpdated: 0,
      totalErrors: 0
    }

    return res.status(200).json({
      success: true,
      status: {
        autoSyncUsers,
        usersNeedingSync: usersNeedingSync.length,
        last24Hours: syncStats,
        nextScheduledSync: getNextScheduledSyncTime()
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Scheduled sync status error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving sync status',
      error: error.message
    })
  }
}

/**
 * Find users that need syncing based on their sync settings
 * 
 * @param {number} maxUsers - Maximum number of users to return
 * @param {boolean} forceSync - Force sync even if recently synced
 * @returns {Promise<Array>} Array of users needing sync
 */
async function findUsersNeedingSync(maxUsers = 10, forceSync = false) {
  try {
    const query = {
      accessToken: { $exists: true, $ne: null },
      $or: [
        { 'syncMetadata.autoSyncEnabled': true },
        { 'syncMetadata.lastAnimeSync': { $exists: false } }
      ]
    }

    if (!forceSync) {
      // Only include users who haven't synced recently
      const syncIntervalHours = 24 // Default sync interval
      const cutoffTime = new Date(Date.now() - (syncIntervalHours * 60 * 60 * 1000))
      
      query.$or.push({
        'syncMetadata.lastAnimeSync': { $lt: cutoffTime }
      })
    }

    const users = await User.find(query)
      .select('username accessToken expiryTime syncMetadata')
      .limit(maxUsers)
      .sort({ 'syncMetadata.lastAnimeSync': 1 }) // Oldest syncs first

    return users
  } catch (error) {
    console.error('Error finding users needing sync:', error)
    return []
  }
}

/**
 * Calculate next scheduled sync time (placeholder)
 * 
 * @returns {string} Next sync time
 */
function getNextScheduledSyncTime() {
  // This would depend on your cron job schedule
  // For example, if you run sync every hour:
  const nextHour = new Date()
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  return nextHour.toISOString()
} 