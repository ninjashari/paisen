/**
 * Jellyfin Library API Endpoint
 * 
 * This endpoint retrieves anime library information from the user's Jellyfin server.
 * Returns filtered anime content with metadata for display in the Jellyfin info page.
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

    // Get anime items from library
    const animeItems = await jellyfinApi.getAnimeItems(user.jellyfinUserId)

    res.status(200).json({
      success: true,
      animeItems: animeItems,
      totalCount: animeItems.length,
      message: `Found ${animeItems.length} anime items in library`
    })

  } catch (error) {
    console.error('Jellyfin library fetch error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Jellyfin library',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
} 