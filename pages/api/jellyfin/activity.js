/**
 * Jellyfin Activity API Endpoint
 * 
 * This endpoint retrieves recent user activity from the Jellyfin server,
 * focusing on anime content playback history and progress.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import JellyfinApi from '@/lib/jellyfin'

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

    // Validate Jellyfin configuration
    if (!user.jellyfinServerUrl || !user.jellyfinApiKey || !user.jellyfinUserId) {
      return res.status(400).json({
        success: false,
        message: 'Jellyfin configuration incomplete'
      })
    }

    // Initialize Jellyfin API
    const jellyfinApi = new JellyfinApi(
      user.jellyfinServerUrl,
      user.jellyfinApiKey,
      user.jellyfinUserId
    )

    // Test connection first
    await jellyfinApi.testConnection()

    // Get recent user activity
    const recentActivity = await jellyfinApi.getUserActivity(user.jellyfinUserId)

    // Filter for anime content only
    const animeActivity = recentActivity.filter(item => {
      const animeInfo = jellyfinApi.extractAnimeInfo(item)
      return isAnimeContent(animeInfo)
    })

    res.status(200).json({
      success: true,
      recentActivity: animeActivity,
      totalCount: animeActivity.length,
      message: `Found ${animeActivity.length} recent anime episodes`
    })

  } catch (error) {
    console.error('Jellyfin activity fetch error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Jellyfin activity',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

/**
 * Determines if content is anime-related
 * @param {Object} animeInfo - Extracted anime information
 * @returns {boolean} True if content is anime
 */
function isAnimeContent(animeInfo) {
  // Check for anime indicators
  const hasAnimeGenres = animeInfo.genres && animeInfo.genres.some(genre => 
    ['anime', 'animation'].includes(genre.toLowerCase())
  )
  
  const hasAnimeStudio = animeInfo.studios && animeInfo.studios.some(studio =>
    isKnownAnimeStudio(studio)
  )
  
  const hasAnimeProvider = animeInfo.externalIds && (
            animeInfo.externalIds.mal
  )
  
  return hasAnimeGenres || hasAnimeStudio || hasAnimeProvider
}

/**
 * Checks if studio is a known anime studio
 * @param {string} studioName - Studio name to check
 * @returns {boolean} True if known anime studio
 */
function isKnownAnimeStudio(studioName) {
  const animeStudios = [
    'mappa', 'studio ghibli', 'toei animation', 'madhouse', 'bones',
    'wit studio', 'ufotable', 'pierrot', 'shaft', 'trigger', 'a-1 pictures',
    'kyoto animation', 'production i.g', 'sunrise', 'deen', 'j.c.staff',
    'white fox', 'cloverworks', 'studio bind', 'orange', 'polygon pictures'
  ]
  
  return animeStudios.includes(studioName.toLowerCase())
} 