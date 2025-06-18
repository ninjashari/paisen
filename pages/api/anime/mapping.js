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
      return handleGet(req, res, offlineDbService)
    case 'POST':
      return handlePost(req, res, offlineDbService, user._id)
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
 * @param {OfflineDatabaseService} offlineDbService - Offline database service
 */
async function handleGet(req, res, service) {
  const { malId, malIds } = req.query;

  if (!malId && !malIds) {
    return res.status(400).json({ success: false, message: 'malId or malIds is required' });
  }

  try {
    if (malIds) {
      const ids = malIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      const mappings = await service.findMappingsByMalIds(ids);
      return res.status(200).json({ success: true, mappings });
    } else {
      const mapping = await service.findMappingByMalId(parseInt(malId));
      if (mapping) {
        return res.status(200).json({ success: true, mapping });
      } else {
        return res.status(404).json({ success: false, message: 'Mapping not found' });
      }
    }
  } catch (error) {
    console.error('Error fetching mapping(s):', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Handle POST requests - Create manual mapping
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {OfflineDatabaseService} offlineDbService - Offline database service
 * @param {ObjectId} userId - User ID
 */
async function handlePost(req, res, service, userId) {
  const { malId, anidbId, animeTitle } = req.body

  if (!malId || !anidbId || !animeTitle) {
    return res.status(400).json({ success: false, message: 'malId, anidbId, and animeTitle are required' })
  }

  try {
    const mapping = await service.createManualMapping(
      parseInt(malId),
      parseInt(anidbId),
      animeTitle,
      userId
    )
    return res.status(201).json({ success: true, mapping })
  } catch (error) {
    console.error('Error creating manual mapping:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
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