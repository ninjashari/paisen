/**
 * Database Anime Statistics API Endpoint
 * 
 * This endpoint provides comprehensive statistics about the anime collection
 * stored in the local MongoDB database, including counts by status, media type,
 * genres, and recently added entries.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
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

  try {
    // Connect to database
    await dbConnect()

    // Get total anime count
    const totalAnime = await Anime.countDocuments()

    // Get anime count by status (from user list status)
    const statusAggregation = await Anime.aggregate([
      { $unwind: { path: '$userListStatus', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$userListStatus.status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    const byStatus = {}
    statusAggregation.forEach(item => {
      if (item._id) {
        byStatus[item._id] = item.count
      }
    })

    // Get anime count by media type
    const mediaTypeAggregation = await Anime.aggregate([
      {
        $group: {
          _id: '$media_type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    const byMediaType = {}
    mediaTypeAggregation.forEach(item => {
      if (item._id) {
        byMediaType[item._id] = item.count
      }
    })

    // Get anime count by genre (top 10)
    const genreAggregation = await Anime.aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    const byGenre = {}
    genreAggregation.forEach(item => {
      if (item._id) {
        byGenre[item._id] = item.count
      }
    })

    // Get recently added anime (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentlyAdded = await Anime.find({
      'syncMetadata.lastSyncedFromMal': { $gte: thirtyDaysAgo }
    })
    .sort({ 'syncMetadata.lastSyncedFromMal': -1 })
    .limit(20)
    .select('malId title alternative_titles media_type status syncMetadata.lastSyncedFromMal')
    .lean()

    res.status(200).json({
      success: true,
      totalAnime,
      byStatus,
      byMediaType,
      byGenre,
      recentlyAdded,
      message: `Retrieved statistics for ${totalAnime} anime entries`
    })

  } catch (error) {
    console.error('Database anime stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch anime statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
} 