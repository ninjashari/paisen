/**
 * Local Anime List API Endpoint
 * 
 * This endpoint provides access to the user's anime list stored in the local database.
 * It serves as a faster alternative to fetching data directly from MAL API.
 * 
 * Features:
 * - Retrieve user's anime list by status
 * - Search and filter anime entries
 * - Include external ID mappings (AniDB)
 * - Pagination support
 */

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Anime from '@/models/Anime'
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
    case 'GET':
      return handleGetAnimeList(req, res, username)
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).json({ 
        success: false, 
        message: `Method ${method} Not Allowed` 
      })
  }
}

/**
 * Handle anime list retrieval request
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} username - Username from session
 */
async function handleGetAnimeList(req, res, username) {
  try {
    const { 
      status,
      search,
      page = 1,
      limit = 50,
      sortBy = 'title',
      sortOrder = 'asc',
      includeExternalIds = false
    } = req.query

    // Validate user exists
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Build query
    const matchStage = {
      'userListStatus.userId': user._id
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      matchStage['userListStatus.status'] = status
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          userStatus: {
            $arrayElemAt: [
              {
                                 $filter: {
                   input: '$userListStatus',
                   cond: { $eq: ['$$this.userId', user._id] }
                 }
              },
              0
            ]
          }
        }
      }
    ]

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { 'alternative_titles.en': { $regex: search, $options: 'i' } },
            { 'alternative_titles.synonyms': { $regex: search, $options: 'i' } }
          ]
        }
      })
    }

    // Add sorting
    const sortStage = {}
    if (sortBy === 'title') {
      sortStage.title = sortOrder === 'desc' ? -1 : 1
    } else if (sortBy === 'score') {
      sortStage['userStatus.score'] = sortOrder === 'desc' ? -1 : 1
    } else if (sortBy === 'episodes_watched') {
      sortStage['userStatus.num_episodes_watched'] = sortOrder === 'desc' ? -1 : 1
    } else if (sortBy === 'updated_at') {
      sortStage['userStatus.updated_at'] = sortOrder === 'desc' ? -1 : 1
    } else if (sortBy === 'mean_score') {
      sortStage.mean = sortOrder === 'desc' ? -1 : 1
    }

    pipeline.push({ $sort: sortStage })

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: 'total' }]
    const countResult = await Anime.aggregate(countPipeline)
    const totalCount = countResult.length > 0 ? countResult[0].total : 0

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: parseInt(limit) })

    // Project only essential fields used by our application
    const projectStage = {
      malId: 1,
      title: 1,
      genres: 1,
      studios: 1,
      media_type: 1,
      status: 1,
      num_episodes: 1,
      start_season: 1,
      userStatus: 1,
      'syncMetadata.lastSyncedFromMal': 1,
      'syncMetadata.lastUpdatedOnMal': 1
    }

    if (includeExternalIds === 'true') {
      projectStage.externalIds = 1
    }

    pipeline.push({ $project: projectStage })

    // Execute query
    const animeList = await Anime.aggregate(pipeline)

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit))
    const hasNextPage = parseInt(page) < totalPages
    const hasPrevPage = parseInt(page) > 1

    return res.status(200).json({
      success: true,
      data: animeList,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      filters: {
        status: status || 'all',
        search: search || null,
        sortBy,
        sortOrder
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Anime list API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving anime list',
      error: error.message
    })
  }
}

/**
 * Get anime statistics for user
 * 
 * @param {ObjectId} userId - User ObjectId
 * @returns {Promise<Object>} Anime statistics
 */
async function getAnimeStats(userId) {
  try {
    const stats = await Anime.aggregate([
      { $match: { 'userListStatus.userId': userId } },
      { $unwind: '$userListStatus' },
      { $match: { 'userListStatus.userId': userId } },
      {
        $group: {
          _id: '$userListStatus.status',
          count: { $sum: 1 },
          totalEpisodes: { $sum: '$userListStatus.num_episodes_watched' },
          averageScore: { $avg: '$userListStatus.score' }
        }
      }
    ])

    return stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalEpisodes: stat.totalEpisodes,
        averageScore: Math.round(stat.averageScore * 100) / 100
      }
      return acc
    }, {})
  } catch (error) {
    console.error('Error getting anime stats:', error)
    return {}
  }
} 