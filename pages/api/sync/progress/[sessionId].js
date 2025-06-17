/**
 * Sync Progress API Endpoint
 * 
 * This endpoint provides real-time sync progress information
 * for a specific session ID. Used by the progress bar component
 * to display live updates during sync operations.
 */

import syncProgressTracker from '@/lib/syncProgress'

export default async function handler(req, res) {
  const { sessionId } = req.query

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    })
  }

  try {
    // Get progress for the session
    const progress = syncProgressTracker.getProgress(sessionId)

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      })
    }

    // Return progress data
    res.status(200).json(progress)

  } catch (error) {
    console.error('Progress API error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
} 