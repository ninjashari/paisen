/**
 * Jellyfin Configuration API Endpoint
 * 
 * This endpoint handles Jellyfin server configuration for users,
 * including server connection setup, testing, and credential management.
 * 
 * Supported Operations:
 * - GET: Retrieve current Jellyfin configuration
 * - POST: Save/update Jellyfin configuration
 * - PUT: Test Jellyfin connection
 * - DELETE: Remove Jellyfin configuration
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import JellyfinApi from '@/lib/jellyfin'

export default async function handler(req, res) {
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

  // Try both username and name fields for compatibility
  const username = session.user.username || session.user.name
  
  if (!username) {
    console.error('No username found in session:', session.user)
    return res.status(400).json({
      success: false,
      message: 'Username not found in session'
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetConfig(req, res, username)
        break
      case 'POST':
        await handleSaveConfig(req, res, username)
        break
      case 'PUT':
        await handleTestConnection(req, res, username)
        break
      case 'DELETE':
        await handleDeleteConfig(req, res, username)
        break
      default:
        res.status(405).json({
          success: false,
          message: 'Method not allowed'
        })
    }
  } catch (error) {
    console.error('Jellyfin config API error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

/**
 * Get current Jellyfin configuration for user
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} username - Username
 */
async function handleGetConfig(req, res, username) {
  console.log('Looking up user with username:', username)
  const user = await User.findOne({ username })
  
  if (!user) {
    console.error('User not found in database:', username)
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  console.log('User found:', user.username)

  // Return configuration without sensitive data
  const config = {
    serverUrl: user.jellyfinServerUrl || '',
    username: user.jellyfinUsername || '',
    syncEnabled: user.jellyfinSyncEnabled || false,
    lastSync: user.jellyfinLastSync || null,
    hasApiKey: !!user.jellyfinApiKey,
    hasUserId: !!user.jellyfinUserId
  }

  res.status(200).json({
    success: true,
    data: config
  })
}

/**
 * Save/update Jellyfin configuration
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} username - Username
 */
async function handleSaveConfig(req, res, username) {
  const { serverUrl, apiKey, jellyfinUsername, syncEnabled } = req.body

  // Validate required fields
  if (!serverUrl || !apiKey || !jellyfinUsername) {
    return res.status(400).json({
      success: false,
      message: 'Server URL, API key, and Jellyfin username are required'
    })
  }

  // Validate server URL format
  try {
    new URL(serverUrl)
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid server URL format'
    })
  }

  // Test connection before saving
  try {
    const jellyfinApi = new JellyfinApi(serverUrl, apiKey)
    const connectionTest = await jellyfinApi.testConnection()
    
    if (!connectionTest.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to connect to Jellyfin server'
      })
    }

    // Get Jellyfin user ID
    const jellyfinUser = await jellyfinApi.getUserByName(jellyfinUsername)
    
    // Update user configuration
    console.log('Updating user configuration for:', username)
    const user = await User.findOneAndUpdate(
      { username },
      {
        jellyfinServerUrl: serverUrl,
        jellyfinApiKey: apiKey,
        jellyfinUsername: jellyfinUsername,
        jellyfinUserId: jellyfinUser.Id,
        jellyfinSyncEnabled: syncEnabled || false,
        modifiedAt: new Date()
      },
      { new: true }
    )

    if (!user) {
      console.error('User not found for update:', username)
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    console.log('User configuration updated successfully:', user.username)

    res.status(200).json({
      success: true,
      message: 'Jellyfin configuration saved successfully',
      data: {
        serverName: connectionTest.serverName,
        version: connectionTest.version,
        jellyfinUsername: jellyfinUsername,
        syncEnabled: syncEnabled || false
      }
    })

  } catch (error) {
    console.error('Error saving Jellyfin config:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to save Jellyfin configuration'
    })
  }
}

/**
 * Test Jellyfin connection with provided credentials
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} username - Username
 */
async function handleTestConnection(req, res, username) {
  const { serverUrl, apiKey, jellyfinUsername } = req.body

  if (!serverUrl || !apiKey) {
    return res.status(400).json({
      success: false,
      message: 'Server URL and API key are required for testing'
    })
  }

  try {
    const jellyfinApi = new JellyfinApi(serverUrl, apiKey)
    
    // Test server connection
    const connectionTest = await jellyfinApi.testConnection()
    
    let jellyfinUser = null
    if (jellyfinUsername) {
      try {
        jellyfinUser = await jellyfinApi.getUserByName(jellyfinUsername)
      } catch (error) {
        console.warn('User not found during test:', error.message)
      }
    }

    res.status(200).json({
      success: true,
      message: 'Connection test successful',
      data: {
        serverName: connectionTest.serverName,
        version: connectionTest.version,
        serverId: connectionTest.id,
        userFound: !!jellyfinUser,
        userId: jellyfinUser?.Id || null
      }
    })

  } catch (error) {
    console.error('Connection test failed:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Connection test failed'
    })
  }
}

/**
 * Delete Jellyfin configuration
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} username - Username
 */
async function handleDeleteConfig(req, res, username) {
  const user = await User.findOneAndUpdate(
    { username },
    {
      $unset: {
        jellyfinServerUrl: 1,
        jellyfinApiKey: 1,
        jellyfinUsername: 1,
        jellyfinUserId: 1,
        jellyfinLastSync: 1
      },
      jellyfinSyncEnabled: false,
      modifiedAt: new Date()
    },
    { new: true }
  )

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  res.status(200).json({
    success: true,
    message: 'Jellyfin configuration deleted successfully'
  })
} 