/**
 * Anime Mapping API Endpoint
 * 
 * This endpoint handles anime mapping operations between MyAnimeList and AniDB.
 * It provides functionality for:
 * - Getting suggested mappings from offline database
 * - Confirming suggested mappings
 * - Creating manual mappings
 * - Searching for mappings
 * 
 * Features:
 * - User authentication required
 * - Mapping confirmation tracking
 * - Manual mapping support
 * - Search functionality
 */

import dbConnect from '../../../lib/dbConnect.js'
import User from '../../../models/User.js'
import AnimeMapping from '../../../models/AnimeMapping.js'
import OfflineDatabaseService from '../../../lib/offlineDatabase.js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth].js'

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

  // Get user document
  const user = await User.findOne({ username })
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  const offlineDbService = new OfflineDatabaseService()

  switch (method) {
    case 'GET':
      return handleGetMapping(req, res, user, offlineDbService)
    case 'POST':
      return handleCreateMapping(req, res, user, offlineDbService)
    case 'PUT':
      return handleConfirmMapping(req, res, user, offlineDbService)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      return res.status(405).json({ 
        success: false, 
        message: `Method ${method} Not Allowed` 
      })
  }
}

/**
 * Handle GET requests - Get mapping for a specific MAL ID or search mappings
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} user - User document
 * @param {OfflineDatabaseService} offlineDbService - Offline database service
 */
async function handleGetMapping(req, res, user, offlineDbService) {
  try {
    const { malId, search, limit = 10 } = req.query

    if (malId) {
      // Get specific mapping by MAL ID
      const mapping = await offlineDbService.findMappingByMalId(parseInt(malId))
      
      if (!mapping) {
        return res.status(404).json({
          success: false,
          message: 'Mapping not found'
        })
      }

      return res.status(200).json({
        success: true,
        mapping: {
          malId: mapping.malId,
          anidbId: mapping.anidbId,
          animeTitle: mapping.animeTitle,
          mappingSource: mapping.mappingSource,
          isConfirmed: mapping.mappingSource === 'user_confirmed' || mapping.mappingSource === 'manual',
          confirmedByUser: mapping.confirmedByUserId?.toString() === user._id.toString(),
          metadata: mapping.offlineDbMetadata,
          createdAt: mapping.createdAt,
          updatedAt: mapping.updatedAt
        }
      })

    } else if (search) {
      // Search mappings by title
      const mappings = await offlineDbService.searchMappingsByTitle(search, parseInt(limit))
      
      return res.status(200).json({
        success: true,
        mappings: mappings.map(mapping => ({
          malId: mapping.malId,
          anidbId: mapping.anidbId,
          animeTitle: mapping.animeTitle,
          mappingSource: mapping.mappingSource,
          isConfirmed: mapping.mappingSource === 'user_confirmed' || mapping.mappingSource === 'manual',
          metadata: mapping.offlineDbMetadata
        }))
      })

    } else {
      return res.status(400).json({
        success: false,
        message: 'Either malId or search parameter is required'
      })
    }

  } catch (error) {
    console.error('Error getting anime mapping:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

/**
 * Handle POST requests - Create manual mapping
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} user - User document
 * @param {OfflineDatabaseService} offlineDbService - Offline database service
 */
async function handleCreateMapping(req, res, user, offlineDbService) {
  try {
    const { malId, anidbId, animeTitle } = req.body

    // Validate required fields
    if (!malId || !anidbId || !animeTitle) {
      return res.status(400).json({
        success: false,
        message: 'malId, anidbId, and animeTitle are required'
      })
    }

    // Validate numeric IDs
    const numericMalId = parseInt(malId)
    const numericAnidbId = parseInt(anidbId)

    if (isNaN(numericMalId) || isNaN(numericAnidbId)) {
      return res.status(400).json({
        success: false,
        message: 'malId and anidbId must be valid numbers'
      })
    }

    // Create manual mapping
    const mapping = await offlineDbService.createManualMapping(
      numericMalId,
      numericAnidbId,
      animeTitle,
      user._id
    )

    return res.status(201).json({
      success: true,
      message: 'Manual mapping created successfully',
      mapping: {
        malId: mapping.malId,
        anidbId: mapping.anidbId,
        animeTitle: mapping.animeTitle,
        mappingSource: mapping.mappingSource,
        isConfirmed: true,
        confirmedByUser: true,
        createdAt: mapping.createdAt,
        updatedAt: mapping.updatedAt
      }
    })

  } catch (error) {
    console.error('Error creating anime mapping:', error)
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A mapping for this MAL ID already exists'
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

/**
 * Handle PUT requests - Confirm existing mapping
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} user - User document
 * @param {OfflineDatabaseService} offlineDbService - Offline database service
 */
async function handleConfirmMapping(req, res, user, offlineDbService) {
  try {
    const { malId } = req.body

    // Validate required fields
    if (!malId) {
      return res.status(400).json({
        success: false,
        message: 'malId is required'
      })
    }

    const numericMalId = parseInt(malId)
    if (isNaN(numericMalId)) {
      return res.status(400).json({
        success: false,
        message: 'malId must be a valid number'
      })
    }

    // Confirm mapping
    const mapping = await offlineDbService.confirmMapping(numericMalId, user._id)

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Mapping not found'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Mapping confirmed successfully',
      mapping: {
        malId: mapping.malId,
        anidbId: mapping.anidbId,
        animeTitle: mapping.animeTitle,
        mappingSource: mapping.mappingSource,
        isConfirmed: true,
        confirmedByUser: true,
        updatedAt: mapping.updatedAt
      }
    })

  } catch (error) {
    console.error('Error confirming anime mapping:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
} 