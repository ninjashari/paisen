/**
 * Database Status API Endpoint
 * 
 * This endpoint provides information about the offline database status,
 * including last update time, statistics, and current status.
 * 
 * Features:
 * - Get last update timestamp
 * - Get mapping statistics
 * - Get download status
 * - Error information if applicable
 */

import dbConnect from '@/lib/dbConnect'
import OfflineDatabaseService from '@/lib/offlineDatabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const { method } = req

  // Only allow GET requests
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
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
    const status = await offlineDbService.getDatabaseStatus()

    return res.status(200).json({
      success: true,
      status: {
        lastUpdated: status.lastUpdated,
        downloadStatus: status.downloadStatus,
        totalEntries: status.totalEntries,
        totalMappings: status.totalMappings,
        confirmedMappings: status.confirmedMappings,
        errorMessage: status.errorMessage,
        needsUpdate: status.lastUpdated ? 
          (Date.now() - new Date(status.lastUpdated).getTime()) > (7 * 24 * 60 * 60 * 1000) : // 7 days
          true
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting database status:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get database status',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
} 