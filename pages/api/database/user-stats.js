/**
 * Database User Statistics API Endpoint
 * 
 * This endpoint provides statistics about users in the system,
 * including total users, active users, and sync status information.
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

  // Get user session
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  try {
    // Connect to database
    await dbConnect()

    // Get total user count
    const totalUsers = await User.countDocuments()

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    })

    // Get users with MAL sync configured
    const syncedUsers = await User.countDocuments({
      accessToken: { $exists: true, $ne: null }
    })

    // Get users with Jellyfin configured
    const jellyfinUsers = await User.countDocuments({
      jellyfinServerUrl: { $exists: true, $ne: null },
      jellyfinApiKey: { $exists: true, $ne: null }
    })

    // Get registration statistics (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Get sync activity statistics
    const syncStats = await User.aggregate([
      {
        $match: {
          jellyfinLastSync: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          averageSyncInterval: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), '$jellyfinLastSync'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          },
          lastSyncDate: { $max: '$jellyfinLastSync' },
          oldestSyncDate: { $min: '$jellyfinLastSync' }
        }
      }
    ])

    res.status(200).json({
      success: true,
      totalUsers,
      activeUsers,
      syncedUsers,
      jellyfinUsers,
      recentRegistrations,
      syncStats: syncStats[0] || {
        averageSyncInterval: 0,
        lastSyncDate: null,
        oldestSyncDate: null
      },
      message: `Retrieved statistics for ${totalUsers} users`
    })

  } catch (error) {
    console.error('Database user stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
} 