/**
 * Update Offline Database API Endpoint
 * 
 * This endpoint handles updating the local offline database with the latest
 * anime mapping data from the manami-project repository.
 * 
 * Features:
 * - Download latest anime-offline-database files
 * - Process and store MAL to AniDB mappings
 * - Return update statistics
 * - Admin/authenticated user access only
 */

import dbConnect from '@/lib/dbConnect'
import OfflineDatabaseService from '@/lib/offlineDatabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const { method } = req

  // Only allow POST requests
  if (method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ 
      success: false, 
      message: `Method ${method} Not Allowed` 
    })
  }

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

  try {
    const offlineDbService = new OfflineDatabaseService()
    
    console.log('Starting offline database update...')
    const result = await offlineDbService.updateOfflineDatabase()

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        statistics: result.stats,
        timestamp: new Date().toISOString()
      })
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: result.error,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Error updating offline database:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update offline database',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
} 